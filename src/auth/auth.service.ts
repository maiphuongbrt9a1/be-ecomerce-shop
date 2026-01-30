import { comparePasswordHelper } from '@/helpers/utils';
import { UserService } from '@/user/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { UserInRequestWithUser } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { CreateUserByGoogleAccountDto } from '@/user/dtos/create.user.dto';
import { Gender, Role, User } from '@prisma/client';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials for login authentication.
   *
   * This method performs the following operations:
   * 1. Retrieves user by email from database
   * 2. Validates user exists and has password set
   * 3. Compares provided password with stored hash
   * 4. Returns processed user object if valid
   * 5. Logs successful validation
   *
   * @param {string} username - The user's email address used as username
   * @param {string} pass - The plain text password to validate
   *
   * @returns {Promise<UserInRequestWithUser>} Processed user object with:
   *   - User ID, email, full name
   *   - First name, last name
   *   - Role (USER, ADMIN, STAFF)
   *   - Active status
   *
   * @throws {UnauthorizedException} If user not found, password missing, or password invalid
   *
   * @remarks
   * - Used by Passport local strategy for authentication
   * - Password comparison uses bcrypt hashing
   * - Returns user without sensitive data (password excluded)
   * - Used in login flow before JWT token generation
   */
  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserInRequestWithUser> {
    try {
      const user = await this.userService.getUserByEmail(username);
      if (!user) {
        throw new UnauthorizedException('Invalid Username or Password');
      }

      if (!user.password) {
        throw new UnauthorizedException('Invalid Username or Password');
      }

      const isValidPassword = await comparePasswordHelper(pass, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid Username or Password');
      }

      const processedUser: UserInRequestWithUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };

      this.logger.log(`(validateUser function) User validated: ${user.email}`);
      return processedUser;
    } catch (error) {
      this.logger.error(
        '(validateUser function) User validation failed: ',
        error,
      );
      throw new UnauthorizedException('Invalid Username or Password');
    }
  }

  /**
   * Generates JWT access token for authenticated user.
   *
   * This method performs the following operations:
   * 1. Creates JWT payload with user information
   * 2. Signs JWT token with configured secret
   * 3. Logs successful login
   * 4. Returns user details and access token
   *
   * @param {UserInRequestWithUser} user - The validated user object containing:
   *   - User ID, email, role
   *   - First name, last name, full name
   *   - Active status
   *
   * @returns {Object} Login response with:
   *   - user: User details (id, name, email, role)
   *   - access_token: JWT token string for authentication
   *
   * @throws {UnauthorizedException} If token generation fails
   *
   * @remarks
   * - JWT contains user ID (sub), email (username), role, and name
   * - Token expiration configured in JWT module settings
   * - Used after successful validateUser call
   * - Access token required for protected routes
   */
  login(user: UserInRequestWithUser) {
    try {
      const payload = {
        sub: user.id,
        username: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
      };

      this.logger.log(`(login function) User logged in: ${user.email}`);
      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.logger.error('(login function) Login failed: ', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Handles user registration process.
   *
   * This method performs the following operations:
   * 1. Logs registration attempt
   * 2. Delegates to UserService.handleRegister
   * 3. Returns registration result
   *
   * @param {CreateAuthDto} registerDto - Registration data containing:
   *   - Email, password
   *   - First name, last name
   *   - Phone number
   *   - Gender (optional)
   *
   * @returns {Promise<any>} Registration result from UserService
   *
   * @throws {Error} If registration fails (re-throws from UserService)
   *
   * @remarks
   * - Wrapper method that delegates to UserService
   * - UserService handles password hashing and validation
   * - Sends activation email with code
   * - User account starts as inactive until email verified
   */
  async handleRegister(registerDto: CreateAuthDto) {
    try {
      this.logger.log(
        '(handleRegister function) Registering user: ' + registerDto.email,
      );
      return await this.userService.handleRegister(registerDto);
    } catch (error) {
      this.logger.error(
        '(handleRegister function) Registration failed: ',
        error,
      );
      throw error;
    }
  }

  /**
   * Handles Google OAuth login and account creation.
   *
   * This method performs the following operations:
   * 1. Validates Google user data from OAuth callback
   * 2. Checks if user exists in database by email
   * 3. Creates new user account if not exists
   * 4. Generates JWT token for existing or new user
   * 5. Logs login/registration event
   * 6. Returns login response with access token
   *
   * @param {any} req - Express request object with req.user from Google OAuth containing:
   *   - Google user id, email
   *   - First name, last name
   *   - Profile information
   *
   * @returns {Promise<Object>} Login response with:
   *   - user: User details (id, name, email, role)
   *   - access_token: JWT token for authentication
   *
   * @throws {UnauthorizedException} If no Google user data or account creation fails
   *
   * @remarks
   * - Creates new user with role USER if not exists
   * - Google users don't have password field
   * - Generates random username from email
   * - Sets 5-minute activation code expiry
   * - Google accounts are immediately active
   */
  async googleLogin(req: any) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('No user from google!');
      }

      const existUser: User | null = await this.userService.getUserByEmail(
        req.user.email,
      );
      if (!existUser) {
        const createUserByGoogleAccountDto: CreateUserByGoogleAccountDto = {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: '',
          googleId: req.user.id,
          username:
            req.user.email.split('@')[0] +
            Math.floor(Math.random() * 100000).toString(),
          role: Role.USER,
          createdAt: new Date(),
          isActive: true,
          gender: Gender.OTHER,
          codeActive: uuidv4().toString(),
          codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
          staffCode: '',
          loyaltyCard: '',
        };

        const newUser: User =
          await this.userService.createAnUserByGoogleAccount(
            createUserByGoogleAccountDto,
          );

        if (!newUser) {
          throw new UnauthorizedException('Cannot create user from google!');
        }

        this.logger.log(
          `(googleLogin function) New user created from Google: ${newUser.email}`,
        );
        return this.login({
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          name: newUser.firstName + ' ' + newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
        });
      }

      this.logger.log(
        `(googleLogin function) Existing user logged in from Google: ${existUser.email}`,
      );
      return this.login({
        id: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        name: existUser.firstName + ' ' + existUser.lastName,
        email: existUser.email,
        role: existUser.role,
        isActive: existUser.isActive,
      });
    } catch (error) {
      this.logger.error('(googleLogin function) Google login failed: ', error);
      throw new UnauthorizedException('Google login failed');
    }
  }

  /**
   * Verifies user activation code to activate account.
   *
   * This method performs the following operations:
   * 1. Logs activation code check attempt
   * 2. Delegates to UserService.handleActive
   * 3. Returns activation result
   *
   * @param {CodeAuthDto} data - Activation data containing:
   *   - User ID
   *   - Activation code from email
   *
   * @returns {Promise<any>} Activation result from UserService
   *
   * @throws {Error} If code invalid, expired, or activation fails (re-throws from UserService)
   *
   * @remarks
   * - Used to verify email address after registration
   * - Code has 5-minute expiration window
   * - Sets user account to active status
   * - Called from email verification link/form
   */
  checkCode = async (data: CodeAuthDto) => {
    try {
      this.logger.log(`(checkCode function) Checking code for ID: ${data.id}`);
      return await this.userService.handleActive(data);
    } catch (error) {
      this.logger.error('(checkCode function) Code check failed: ', error);
      throw error;
    }
  };

  /**
   * Resends activation code to user email.
   *
   * This method performs the following operations:
   * 1. Logs retry activation attempt
   * 2. Delegates to UserService.retryActive
   * 3. Returns retry result
   *
   * @param {string} data - User's email address
   *
   * @returns {Promise<any>} Retry result from UserService
   *
   * @throws {Error} If email not found or resend fails (re-throws from UserService)
   *
   * @remarks
   * - Used when activation code expired or not received
   * - Generates new activation code with fresh expiry
   * - Sends new email with updated code
   * - Can be called multiple times if needed
   */
  retryActive = async (data: string) => {
    try {
      this.logger.log(
        `(retryActive function) Retrying activation for email: ${data}`,
      );
      return await this.userService.retryActive(data);
    } catch (error) {
      this.logger.error(
        '(retryActive function) Retry activation failed: ',
        error,
      );
      throw error;
    }
  };

  /**
   * Initiates password reset process by sending reset code.
   *
   * This method performs the following operations:
   * 1. Logs password reset request
   * 2. Delegates to UserService.retryPassword
   * 3. Returns reset initiation result
   *
   * @param {string} data - User's email address
   *
   * @returns {Promise<any>} Reset initiation result from UserService
   *
   * @throws {Error} If email not found or send fails (re-throws from UserService)
   *
   * @remarks
   * - Generates password reset code
   * - Sends reset code via email
   * - Code has expiration time
   * - Used in "Forgot Password" flow
   */
  retryPassword = async (data: string) => {
    try {
      this.logger.log(
        '(retryPassword function) Retrying password for email: ' + data,
      );
      return await this.userService.retryPassword(data);
    } catch (error) {
      this.logger.error(
        '(retryPassword function) Retry password failed: ',
        error,
      );
      throw error;
    }
  };

  /**
   * Changes user password after verification.
   *
   * This method performs the following operations:
   * 1. Logs password change attempt
   * 2. Delegates to UserService.changePassword
   * 3. Returns password change result
   *
   * @param {ChangePasswordAuthDto} data - Password change data containing:
   *   - Email address
   *   - Reset code from email
   *   - New password
   *
   * @returns {Promise<any>} Password change result from UserService
   *
   * @throws {Error} If code invalid, expired, or password update fails (re-throws from UserService)
   *
   * @remarks
   * - Verifies reset code before allowing change
   * - Hashes new password before storage
   * - Invalidates reset code after successful change
   * - Used in password reset flow
   */
  changePassword = async (data: ChangePasswordAuthDto) => {
    try {
      this.logger.log(
        '(changePassword function) Changing password for email: ' + data.email,
      );
      return await this.userService.changePassword(data);
    } catch (error) {
      this.logger.error(
        '(changePassword function) Change password failed: ',
        error,
      );
      throw error;
    }
  };
}
