import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  User,
  Prisma,
  Role,
  Address,
  Vouchers,
  Category,
  Shipments,
  SizeProfiles,
  Cart,
  ShopOffice,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateUserByGoogleAccountDto,
  CreateUserWithFileDto,
} from '@/user/dtos/create.user.dto';
import { UpdateUserWithFileDto } from '@/user/dtos/update.user.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  formatMediaFieldWithLogging,
  hashPasswordHelper,
} from '@/helpers/utils';
import { createPaginator } from 'prisma-pagination';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from '@/auth/dto/create-auth.dto';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
  OrdersWithFullInformation,
  OrdersWithFullInformationInclude,
  ProductsWithProductVariantsAndTheirMedia,
  ProductVariantsWithMediaInformation,
  RequestsWithMedia,
  ReviewsWithMedia,
  UserCartDetailInformation,
  UserVoucherDetailInformation,
  UserWithUserMedia,
} from '@/helpers/types/types';
import { UpdateCartDto } from '@/cart/dto/update-cart.dto';
import { CreateCartDto } from '@/cart/dto/create-cart.dto';
import { CreateCartItemDto } from '@/cart-items/dto/create-cart-item.dto';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Retrieves a paginated list of all users with avatar media.
   *
   * This method performs the following operations:
   * 1. Fetches users from the database with pagination
   * 2. Includes only avatar media for each user (isAvatarFile = true)
   * 3. Formats all media URLs to public HTTPS URLs
   * 4. Orders results by user ID
   * 5. Logs retrieval operation
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of users to retrieve per page
   *
   * @returns {Promise<UserWithUserMedia[] | []>} Array of users with details including:
   *   - User information (id, email, phone, username, role, status)
   *   - Avatar media with formatted public HTTPS URLs
   *   Returns empty array if no users found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by user ID in ascending order
   * - Only avatar media is included, not all user media
   * - Media URLs are converted to public HTTPS URLs
   */
  // Get the list of all User
  async getAllUser(
    page: number,
    perPage: number,
  ): Promise<UserWithUserMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<UserWithUserMedia, Prisma.UserFindManyArgs>(
        this.prismaService.user,
        {
          include: {
            userMedia: {
              where: {
                isAvatarFile: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      for (let index = 0; index < result.data.length; index++) {
        result.data[index].userMedia = formatMediaFieldWithLogging(
          result.data[index].userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          result.data[index].id,
          this.logger,
        );
      }

      this.logger.log('Users retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving users', error);
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  /**
   * Retrieves a single user by ID with avatar media.
   *
   * This method performs the following operations:
   * 1. Queries the database for the user by ID
   * 2. Includes only avatar media files
   * 3. Formats media URLs to public HTTPS URLs
   * 4. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the user to retrieve
   *
   * @returns {Promise<UserWithUserMedia | null>} The user with details including:
   *   - User information (id, email, phone, username, role, status)
   *   - Avatar media with formatted public HTTPS URLs
   *   Returns null if user not found
   *
   * @throws {NotFoundException} If user is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Used for user profile pages and authentication
   * - Only avatar media is included
   */
  // Get an User by id
  async getUserDetail(id: number): Promise<UserWithUserMedia | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        include: {
          userMedia: {
            where: {
              isAvatarFile: true,
            },
          },
        },
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      // generate full http url for media files
      user.userMedia = formatMediaFieldWithLogging(
        user.userMedia,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'user',
        user.id,
        this.logger,
      );

      this.logger.log('User retrieved successfully', id);
      return user;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  /**
   * Retrieves a user by email address with avatar media.
   *
   * This method performs the following operations:
   * 1. Queries the database for the user by email
   * 2. Includes only avatar media files
   * 3. Formats media URLs to public HTTPS URLs
   * 4. Logs retrieval operation
   *
   * @param {string} email - The email address of the user to retrieve
   *
   * @returns {Promise<UserWithUserMedia | null>} The user with details including:
   *   - User information (id, email, phone, username, role, status)
   *   - Avatar media with formatted public HTTPS URLs
   *   Returns null if user not found
   *
   * @throws {NotFoundException} If user is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Email is unique, so maximum one result
   * - Used during login and email verification
   */
  // Get an User by email
  async getUserByEmail(email: string): Promise<UserWithUserMedia | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        include: {
          userMedia: {
            where: {
              isAvatarFile: true,
            },
          },
        },
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      // generate full http url for media files
      user.userMedia = formatMediaFieldWithLogging(
        user.userMedia,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'user',
        user.id,
        this.logger,
      );

      this.logger.log('User retrieved successfully', email);
      return user;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  /**
   * Retrieves a user by phone number with avatar media.
   *
   * This method performs the following operations:
   * 1. Queries the database for the user by phone number
   * 2. Includes only avatar media files
   * 3. Formats media URLs to public HTTPS URLs
   * 4. Logs retrieval operation
   *
   * @param {string} phone - The phone number of the user to retrieve
   *
   * @returns {Promise<UserWithUserMedia | null>} The user with details including:
   *   - User information (id, email, phone, username, role, status)
   *   - Avatar media with formatted public HTTPS URLs
   *   Returns null if user not found
   *
   * @throws {NotFoundException} If user is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Phone number is unique, so maximum one result
   * - Useful for phone-based account recovery
   */
  // Get an User by phone
  async getUserByPhone(phone: string): Promise<UserWithUserMedia | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        include: {
          userMedia: {
            where: {
              isAvatarFile: true,
            },
          },
        },
        where: {
          phone: phone,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      // generate full http url for media files
      user.userMedia = formatMediaFieldWithLogging(
        user.userMedia,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'user',
        user.id,
        this.logger,
      );

      this.logger.log('User retrieved successfully', phone);
      return user;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  /**
   * Retrieves a user by username with avatar media.
   *
   * This method performs the following operations:
   * 1. Queries the database for the user by username
   * 2. Includes only avatar media files
   * 3. Formats media URLs to public HTTPS URLs
   * 4. Logs retrieval operation
   *
   * @param {string} username - The username of the user to retrieve
   *
   * @returns {Promise<UserWithUserMedia | null>} The user with details including:
   *   - User information (id, email, phone, username, role, status)
   *   - Avatar media with formatted public HTTPS URLs
   *   Returns null if user not found
   *
   * @throws {NotFoundException} If user is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Username is unique, so maximum one result
   * - Used for user profile lookups
   */
  // Get an User by username
  async getUserByUserName(username: string): Promise<UserWithUserMedia | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        include: {
          userMedia: {
            where: {
              isAvatarFile: true,
            },
          },
        },
        where: {
          username: username,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      // generate full http url for media files
      user.userMedia = formatMediaFieldWithLogging(
        user.userMedia,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'user',
        user.id,
        this.logger,
      );

      this.logger.log('User retrieved successfully', username);
      return user;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  /**
   * Creates a new user account with avatar file upload.
   *
   * This method performs the following operations:
   * 1. Hashes the user password
   * 2. Creates a new user in the database with activation code
   * 3. Uploads the avatar file to S3 storage
   * 4. Retrieves the created user with avatar media
   * 5. Formats media URLs to public HTTPS URLs
   * 6. Logs the creation operation
   *
   * @param {Express.Multer.File} file - The avatar image file to upload
   * @param {CreateUserWithFileDto} data - The data transfer object containing user information:
   *   - firstName, lastName, email, phone, password, username
   *   - role (defaults to USER), staffCode, shopOfficeId
   *   - loyaltyCard, point
   *
   * @returns {Promise<UserWithUserMedia>} The created user with details including:
   *   - User information (id, email, phone, username, role, status)
   *   - Avatar media with formatted public HTTPS URLs
   *   - Account activation code and expiry
   *
   * @throws {NotFoundException} If user creation, avatar upload, or retrieval fails
   * @throws {BadRequestException} If password hashing fails
   *
   * @remarks
   * - User account starts inactive (isActive = false)
   * - Activation code expires in 5 minutes
   * - Avatar file is uploaded to S3
   * - Password is hashed before storage
   */
  // Create an User
  async createAnUser(
    file: Express.Multer.File,
    data: CreateUserWithFileDto,
  ): Promise<UserWithUserMedia> {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        username,
        role,
        staffCode,
        shopOfficeId,
        loyaltyCard,
        point,
      } = data;

      const hashPassword = await hashPasswordHelper(password);
      if (!hashPassword) {
        throw new Error('Hash password for create user failed!');
      }

      const newUser = await this.prismaService.user.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          password: hashPassword,
          username: username,
          role: role ?? Role.USER,
          createdAt: new Date(Date.now()),
          isActive: false,
          codeActive: uuidv4().toString(),
          codeActiveExpire: new Date(Date.now() + 5 * 60 * 1000),
          staffCode: staffCode,
          shopOfficeId: shopOfficeId,
          loyaltyCard: loyaltyCard,
          points: point ?? 0,
        },
      });

      if (!newUser) {
        throw new NotFoundException('Failed to create new user');
      }

      const mediaForUserAvatar = await this.awsService.uploadOneUserAvatarFile(
        file,
        newUser.id.toString(),
      );

      if (!mediaForUserAvatar) {
        throw new NotFoundException('Failed to upload user avatar file');
      }

      const returnUser = await this.prismaService.user.findUnique({
        where: { id: newUser.id },
        include: {
          userMedia: {
            where: {
              userId: newUser.id,
              isAvatarFile: true,
            },
          },
        },
      });

      if (!returnUser) {
        throw new NotFoundException('Failed to retrieve created user');
      }

      // generate full http url for media files
      returnUser.userMedia = formatMediaFieldWithLogging(
        returnUser.userMedia,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'user',
        returnUser.id,
        this.logger,
      );

      this.logger.log('User created successfully', newUser.id);
      return returnUser;
    } catch (error) {
      this.logger.log('Error creating user', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Creates a new user account via Google OAuth authentication.
   *
   * This method performs the following operations:
   * 1. Creates a new user with Google OAuth credentials (googleId)
   * 2. Generates activation code and sets 5-minute expiry
   * 3. Initializes user with inactive status
   * 4. Logs the user creation event
   * 5. Returns the created user record
   *
   * @param {CreateUserByGoogleAccountDto} data - The data transfer object containing:
   *   - firstName, lastName, email, phone
   *   - googleId (unique identifier from Google OAuth)
   *   - username, role (defaults to USER)
   *   - staffCode, shopOfficeId, loyaltyCard, point
   *
   * @returns {Promise<User>} The created user with details including:
   *   - User ID, email, phone, username, role
   *   - googleId reference
   *   - Activation code and expiry
   *   - Initial points/loyalty card information
   *
   * @throws {NotFoundException} If user creation fails
   * @throws {BadRequestException} If database operation fails
   *
   * @remarks
   * - User account starts inactive (isActive = false)
   * - Activation code expires in 5 minutes
   * - No password required for Google OAuth users
   * - Avatar must be uploaded separately after account creation
   */
  // Create an User
  async createAnUserByGoogleAccount(
    data: CreateUserByGoogleAccountDto,
  ): Promise<User> {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        googleId,
        username,
        role,
        staffCode,
        shopOfficeId,
        loyaltyCard,
        point,
      } = data;

      const newUser = await this.prismaService.user.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          googleId: googleId,
          username: username,
          role: role ?? Role.USER,
          createdAt: new Date(Date.now()),
          isActive: false,
          codeActive: uuidv4().toString(),
          codeActiveExpire: new Date(Date.now() + 5 * 60 * 1000),
          staffCode: staffCode,
          shopOfficeId: shopOfficeId,
          loyaltyCard: loyaltyCard,
          points: point ?? 0,
        },
      });

      if (!newUser) {
        throw new NotFoundException('Failed to create new user');
      }

      this.logger.log('User created successfully', newUser.id);
      return newUser;
    } catch (error) {
      this.logger.log('Error creating user', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Deletes a user account and removes all associated media files from S3.
   *
   * This method performs the following operations:
   * 1. Retrieves all avatar media files associated with the user
   * 2. Deletes the user record from the database
   * 3. Removes each avatar file from S3 storage
   * 4. Logs the deletion operation
   * 5. Returns the deleted user record
   *
   * @param {number} id - The user ID to delete
   *
   * @returns {Promise<User>} The deleted user with all user information
   *
   * @throws {BadRequestException} If user deletion fails or S3 deletion fails
   * @throws {NotFoundException} If user media retrieval fails
   *
   * @remarks
   * - This operation is irreversible; all user data is permanently deleted
   * - Avatar files are deleted from S3 before database deletion
   * - All related user data (orders, reviews, etc.) follows cascading delete rules
   * - Deletion is logged with user ID for audit trail
   */
  // Delete an User and their avatar media file
  async deleteAnUser(id: number): Promise<User> {
    try {
      this.logger.log('User deleted: ', id);
      const userMedias = await this.prismaService.media.findMany({
        where: {
          userId: id,
          isAvatarFile: true,
        },
      });
      // delete user information
      const deleteUser = await this.prismaService.user.delete({
        where: { id: id },
      });

      if (!deleteUser) {
        throw new BadRequestException('Failed to delete user');
      }

      // delete avatar files from s3 and media table
      for (let index = 0; index < userMedias.length; index++) {
        const mediaItem = userMedias[index];
        await this.awsService.deleteFileFromS3(mediaItem.url);
      }

      return deleteUser;
    } catch (error) {
      this.logger.log('Error deleting user', error);
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Updates a user account with optional avatar file replacement.
   *
   * This method performs the following operations:
   * 1. Retrieves existing avatar media files
   * 2. Prepares update payload with new user information
   * 3. Hashes new password if provided
   * 4. Updates shop office relationship (connect/disconnect)
   * 5. Uploads new avatar file to S3 if provided
   * 6. Removes old avatar files from S3
   * 7. Retrieves updated user with formatted media URLs
   * 8. Logs the update operation
   *
   * @param {number} id - The user ID to update
   * @param {UpdateUserWithFileDto} data - The data transfer object containing:
   *   - firstName, lastName, email, phone, username
   *   - password (optional, will be hashed)
   *   - role, staffCode, shopOfficeId, loyaltyCard, point
   * @param {Express.Multer.File} file - Optional new avatar image file (replaces existing)
   *
   * @returns {Promise<UserWithUserMedia>} The updated user with details including:
   *   - Updated user information
   *   - Avatar media with formatted public HTTPS URLs
   *   - Shop office relationship information
   *
   * @throws {BadRequestException} If update, password hashing, or file operations fail
   * @throws {NotFoundException} If user or media retrieval fails
   *
   * @remarks
   * - Password is only updated if provided and non-empty
   * - Old avatar files are deleted when new avatar is uploaded
   * - Shop office relationship can be connected, disconnected, or left unchanged
   * - All timestamps and media URLs are updated during operation
   */
  // Update an User
  async updateAnUser(
    id: number,
    data: UpdateUserWithFileDto,
    file: Express.Multer.File,
  ): Promise<UserWithUserMedia> {
    try {
      // get old avatar media files of user
      const oldMediaFiles = await this.prismaService.media.findMany({
        where: {
          userId: id,
          isAvatarFile: true,
        },
      });

      // Build update payload without password first
      const { shopOfficeId, password, point, ...otherData } = data;

      const updateData: Prisma.UserUpdateInput = {
        ...otherData,
        updatedAt: new Date(Date.now()),
      };

      if (point !== undefined && point !== null) {
        updateData.points = point; // map DTO 'point' -> model 'points'
      }

      // create password hash if have new password
      if (password && password.trim().length > 0) {
        const hashed = await hashPasswordHelper(password);
        if (!hashed) {
          throw new Error('Hash password for update user failed!');
        }
        updateData.password = hashed;
      }

      if (shopOfficeId) {
        updateData.shopOffice = {
          connect: {
            id: shopOfficeId,
          },
        };
      } else if (shopOfficeId === null || shopOfficeId === undefined) {
        updateData.shopOffice = {
          disconnect: true,
        };
      }

      // update user data in database
      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: updateData,
      });

      if (!updatedUser) {
        throw new BadRequestException('Failed to update user');
      }

      // update avatar media files if have new uploaded files
      // create new avatar media file for user
      if (file) {
        const mediaUploadForUserAvatar =
          await this.awsService.uploadOneUserAvatarFile(
            file,
            updatedUser.id.toString(),
          );

        if (!mediaUploadForUserAvatar) {
          throw new BadRequestException('Failed to upload user avatar file');
        }

        // Delete old avatar media files if any
        if (oldMediaFiles && oldMediaFiles.length > 0) {
          await this.prismaService.media.deleteMany({
            where: { id: { in: oldMediaFiles.map((media) => media.id) } },
          });

          for (const media of oldMediaFiles) {
            await this.awsService.deleteFileFromS3(media.url);
          }
        }
      }

      // generate full http url for media files
      const returnUser = await this.prismaService.user.findUnique({
        include: {
          userMedia: {
            where: {
              userId: updatedUser.id,
              isAvatarFile: true,
            },
          },
        },
        where: { id: updatedUser.id },
      });

      if (!returnUser) {
        throw new NotFoundException(
          'Failed to retrieve updated user information',
        );
      }

      returnUser.userMedia = formatMediaFieldWithLogging(
        returnUser.userMedia,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        'user',
        returnUser.id,
        this.logger,
      );

      // return updated user with full media url
      this.logger.log('User updated successfully with id: ' + returnUser.id);

      this.logger.log('User updated successfully', id);
      return returnUser;
    } catch (error) {
      this.logger.log('Error updating user', error);
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Handles user registration with email validation and account creation.
   *
   * This method performs the following operations:
   * 1. Validates that email is not already registered
   * 2. Hashes the user password
   * 3. Generates unique activation code with 5-minute expiry
   * 4. Creates new user account in inactive state
   * 5. Sends activation email to user
   * 6. Logs successful registration
   * 7. Returns created user record
   *
   * @param {CreateAuthDto} registerDto - The registration data transfer object containing:
   *   - firstName, lastName
   *   - email (must be unique)
   *   - phone, username, password
   *
   * @returns {Promise<User>} The created user account with details including:
   *   - User ID, email, phone, username, role (defaults to USER)
   *   - Inactive status with activation code and expiry
   *   - Account creation timestamp
   *
   * @throws {BadRequestException} If email already exists or registration fails
   * @throws {BadRequestException} If password hashing fails
   *
   * @remarks
   * - User starts with inactive status (isActive = false)
   * - Activation code expires in 5 minutes from creation
   * - Activation email is sent automatically during registration
   * - Email is the primary identifier for account uniqueness
   */
  async handleRegister(registerDto: CreateAuthDto): Promise<User> {
    try {
      const { firstName, lastName, email, phone, password, username } =
        registerDto;

      const isExist = await this.prismaService.user.findUnique({
        where: { email: email },
      });
      if (isExist) {
        throw new BadRequestException(
          `Email is existed: ${email}. Please use another email.`,
        );
      }

      const hashPassword = await hashPasswordHelper(password);
      if (!hashPassword) {
        throw new Error('Hash password for create user failed!');
      }

      const user = await this.prismaService.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashPassword,
          username,
          role: Role.USER,
          createdAt: new Date(Date.now()),
          isActive: false,
          codeActive: uuidv4().toString(),
          codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
        },
      });

      let fullname = user.email;
      if (user.firstName && user.lastName) {
        fullname = user.firstName + ' ' + user.lastName;
      }

      this.mailerService
        .sendMail({
          to: user.email,
          from: this.configService.get<string>('MAIL_FROM'),
          subject: 'Activate your account at E-commerce shop',
          text: 'Please use the code to activate your account',
          template: 'register',
          context: {
            name: fullname,
            activationCode: user.codeActive,
          },
        })
        .then(() => {
          return 'Send email from ecommerce shop successfully!';
        })
        .catch(() => {
          throw new Error('Send email failed!');
        });

      this.logger.log('User registered successfully', user.id);
      return user;
    } catch (error) {
      this.logger.log('Error registering user', error);
      throw new BadRequestException('Failed to register user');
    }
  }

  /**
   * Activates a user account using activation code verification.
   *
   * This method performs the following operations:
   * 1. Retrieves user by ID and matching activation code
   * 2. Validates that activation code has not expired
   * 3. Activates the user account if code is valid
   * 4. Clears activation code and expiry time
   * 5. Logs successful account activation
   * 6. Returns activated user record
   *
   * @param {CodeAuthDto} data - The activation data containing:
   *   - id (user ID)
   *   - codeActive (activation code from email)
   *
   * @returns {Promise<User>} The activated user with:
   *   - isActive set to true
   *   - Cleared activation code (codeActive = null)
   *   - Cleared code expiry (codeActiveExpire = null)
   *   - Updated timestamp
   *
   * @throws {BadRequestException} If code is expired or invalid
   * @throws {NotFoundException} If user not found
   *
   * @remarks
   * - Activation code must be validated before expiry (5 minutes)
   * - Account remains inactive until activation code is verified
   * - Once activated, user can log in with email/password
   * - Expired codes require retry with new activation code
   */
  async handleActive(data: CodeAuthDto) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: data.id,
          codeActive: data.codeActive,
        },
      });
      if (!user) {
        throw new BadRequestException('Code active is expired or invalid');
      }

      //check expire code
      const isBeforeCheck = dayjs().isBefore(user.codeActiveExpire);

      if (isBeforeCheck) {
        //valid => update user
        const userAfterUpdate = await this.prismaService.user.update({
          where: {
            id: data.id,
            codeActive: data.codeActive,
          },
          data: {
            isActive: true,
          },
        });

        this.logger.log('User activated successfully', data.id);
        return userAfterUpdate;
      } else {
        throw new BadRequestException('Code active is expired or invalid');
      }
    } catch (error) {
      this.logger.log('Error activating user', error);
      throw new BadRequestException('Failed to activate user');
    }
  }

  /**
   * Sends a new activation code to user email for account activation retry.
   *
   * This method performs the following operations:
   * 1. Finds user by email address
   * 2. Validates user account exists and is not already active
   * 3. Generates new activation code (UUID format)
   * 4. Updates activation code with 5-minute expiry
   * 5. Sends activation email with new code
   * 6. Logs successful retry operation
   * 7. Returns updated user record
   *
   * @param {string} email - The user email address to send retry code to
   *
   * @returns {Promise<User>} The updated user with details:
   *   - New activation code
   *   - Updated code expiry (5 minutes from now)
   *   - All existing user information
   *
   * @throws {BadRequestException} If account not found, already active, or email send fails
   * @throws {NotFoundException} If user cannot be updated
   *
   * @remarks
   * - Can only retry for inactive accounts
   * - Old activation code is replaced with new code
   * - New code expires in 5 minutes
   * - Activation email is automatically sent after code generation
   * - Used when original activation code expires or user requests new code
   */
  async retryActive(email: string) {
    try {
      //check email
      const user = await this.prismaService.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        throw new BadRequestException('This account does not exist!');
      }
      if (user.isActive) {
        throw new BadRequestException('This account has been activated!');
      }

      //send Email
      const codeActive = uuidv4().toString();

      //update user
      const userAfterUpdate = await this.prismaService.user.update({
        where: {
          id: user.id,
        },

        data: {
          codeActive: codeActive,
          codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
        },
      });

      //send email
      await this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: 'Activate your account at BK E-commerce shop', // Subject line
        template: 'register',
        context: {
          name: user?.lastName ?? user.email,
          activationCode: codeActive,
        },
      });

      this.logger.log('User re-activation email sent successfully', user.id);
      return userAfterUpdate;
    } catch (error) {
      this.logger.log('Error re-activating user', error);
      throw new BadRequestException('Failed to re-activate user');
    }
  }

  /**
   * Sends a password reset code to user email for password recovery.
   *
   * This method performs the following operations:
   * 1. Finds user by email address
   * 2. Validates user account exists
   * 3. Generates new password reset code (UUID format)
   * 4. Updates reset code with 5-minute expiry
   * 5. Sends password reset email with reset code
   * 6. Logs successful password retry operation
   * 7. Returns updated user record with reset code
   *
   * @param {string} email - The user email address to send password reset code to
   *
   * @returns {Promise<User>} The updated user with details:
   *   - New password reset code
   *   - Updated code expiry (5 minutes from now)
   *   - All existing user information
   *
   * @throws {BadRequestException} If account not found or email send fails
   * @throws {NotFoundException} If user cannot be updated
   *
   * @remarks
   * - Password reset code expires in 5 minutes
   * - Code can be used with changePassword method
   * - New code replaces any existing reset code
   * - Email contains reset code for user verification
   * - Used for "Forgot Password" workflow
   */
  async retryPassword(email: string) {
    try {
      //check email
      const user = await this.prismaService.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        throw new BadRequestException('This account does not exist!');
      }

      //send Email
      const codeActive = uuidv4().toString();

      //update user
      const userAfterUpdate = await this.prismaService.user.update({
        where: {
          id: user.id,
        },

        data: {
          codeActive: codeActive,
          codeActiveExpire: dayjs().add(5, 'minutes').toDate(),
        },
      });

      //send email
      await this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: 'Change your password account at BK E-commerce shop', // Subject line
        template: 'register',
        context: {
          name: user?.lastName ?? user.email,
          activationCode: codeActive,
        },
      });

      this.logger.log('User retry-password email sent successfully', user.id);
      return userAfterUpdate;
    } catch (error) {
      this.logger.log('Error retry-password user', error);
      throw new BadRequestException('Failed to retry-password user');
    }
  }

  /**
   * Changes user password using reset code verification.
   *
   * This method performs the following operations:
   * 1. Validates password and confirmation password match
   * 2. Finds user by email address
   * 3. Validates reset code has not expired
   * 4. Hashes new password
   * 5. Updates user password in database
   * 6. Clears reset code and expiry
   * 7. Logs successful password change
   * 8. Returns user with updated password
   *
   * @param {ChangePasswordAuthDto} data - The password change data containing:
   *   - email (user email)
   *   - codeActive (password reset code)
   *   - password (new password)
   *   - confirmPassword (confirmation of new password)
   *
   * @returns {Promise<User>} The updated user with new password
   *
   * @throws {BadRequestException} If passwords don't match, user not found, or code expired
   * @throws {BadRequestException} If password hashing or update fails
   *
   * @remarks
   * - Password and confirmPassword must match exactly
   * - Reset code must be valid and not expired (5 minutes)
   * - Old password is not required for reset
   * - Password is hashed before storage
   * - Once password is changed, reset code is cleared
   * - Used after password reset email verification
   */
  async changePassword(data: ChangePasswordAuthDto) {
    try {
      if (data.confirmPassword !== data.password) {
        throw new BadRequestException(
          'Password / Confirm password does not match.',
        );
      }

      //check email
      const user = await this.prismaService.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new BadRequestException('Account does not exist!');
      }

      //check expire code
      const isBeforeCheck = dayjs().isBefore(user.codeActiveExpire);

      if (isBeforeCheck) {
        //valid => update password
        const newPassword = await hashPasswordHelper(data.password);
        const userAfterUpdate = await this.prismaService.user.update({
          where: {
            email: data.email,
          },
          data: {
            password: newPassword,
          },
        });

        this.logger.log(
          'User changed password successfully',
          userAfterUpdate.id,
        );
        return userAfterUpdate;
      } else {
        throw new BadRequestException(
          'Activation code is invalid or has expired',
        );
      }
    } catch (error) {
      this.logger.log('Error changing password for user', error);
      throw new BadRequestException('Failed to change password for user');
    }
  }

  /**
   * Retrieves paginated addresses for a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries addresses for user ID
   * 3. Sorts results by address ID ascending
   * 4. Returns paginated address data
   * 5. Logs successful retrieval
   *
   * @param {number} userId - The user ID to retrieve addresses for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of addresses per page
   *
   * @returns {Promise<Address[] | []>} Array of addresses or empty array:
   *   - address ID, user ID
   *   - street, ward, district, city, state
   *   - postal code, country
   *   - Default address status, created/updated timestamps
   *
   * @throws {BadRequestException} If address retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by address ID in ascending order
   * - Returns empty array if user has no addresses
   * - Used for user profile address management
   */
  async getAddressOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Address[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Address, Prisma.AddressFindManyArgs>(
        this.prismaService.address,
        { where: { userId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('User addresses retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving user addresses', error);
      throw new BadRequestException('Failed to retrieve user addresses');
    }
  }

  /**
   * Retrieves shop office information assigned to a user.
   *
   * This method performs the following operations:
   * 1. Finds user by ID
   * 2. Validates user exists and has shop office assigned
   * 3. Retrieves shop office details
   * 4. Logs successful retrieval
   * 5. Returns shop office information
   *
   * @param {number} userId - The user ID to get shop office for
   *
   * @returns {Promise<ShopOffice>} The shop office details including:
   *   - Shop office ID, name, location
   *   - Address details, contact information
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If user not found or has no shop office assigned
   * @throws {BadRequestException} If shop office retrieval fails
   *
   * @remarks
   * - Only staff/admin users have shop office assignments
   * - User must have shopOfficeId field populated
   * - Throws error if shop office not found in database
   * - Used for staff profile and office management
   */
  async getShopOfficeOfUser(userId: number): Promise<ShopOffice> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      if (!user.shopOfficeId) {
        throw new NotFoundException('User has no shop office assigned!');
      }

      const shopInformation = await this.prismaService.shopOffice.findFirst({
        where: { id: user.shopOfficeId },
      });

      if (!shopInformation) {
        throw new NotFoundException('Shop Information not found!');
      }

      this.logger.log('Shop information retrieved successfully', userId);
      return shopInformation;
    } catch (error) {
      this.logger.log('Error retrieving shop information', error);
      throw new BadRequestException('Failed to retrieve shop information');
    }
  }

  /**
   * Retrieves the avatar URL for a user.
   *
   * This method performs the following operations:
   * 1. Finds the most recent avatar media file for user
   * 2. Validates avatar exists
   * 3. Formats media URL to public HTTPS URL
   * 4. Logs media URL transformation if needed
   * 5. Logs successful avatar retrieval
   * 6. Returns formatted avatar URL
   *
   * @param {number} userId - The user ID to retrieve avatar for
   *
   * @returns {Promise<string>} The formatted public HTTPS URL to avatar image
   *
   * @throws {NotFoundException} If user avatar not found
   * @throws {BadRequestException} If avatar retrieval fails
   *
   * @remarks
   * - Retrieves only avatar files (isAvatarFile = true)
   * - Excludes review and product variant media
   * - Returns most recently created avatar (sorted by createdAt DESC)
   * - URL is converted to public HTTPS format for web access
   * - Used for user profile avatar display
   */
  async getAvatarOfUser(userId: number): Promise<string> {
    try {
      const mediaInformation = await this.prismaService.media.findFirst({
        where: {
          userId: userId,
          reviewId: null,
          productVariantId: null,
          isAvatarFile: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!mediaInformation) {
        throw new NotFoundException('User avatar not found!');
      }

      // get full link avatar file
      const originalMedia = mediaInformation.url;
      mediaInformation.url = this.awsService.buildPublicMediaUrl(
        mediaInformation.url,
      );

      if (originalMedia !== mediaInformation.url) {
        this.logger.log(`Media field changed for user media`);
      }

      this.logger.log('User avatar retrieved successfully', userId);
      return mediaInformation.url;
    } catch (error) {
      this.logger.log('Error retrieving user avatar', error);
      throw new BadRequestException('Failed to retrieve user avatar');
    }
  }

  /**
   * Retrieves paginated vouchers created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries vouchers where createdBy matches user ID
   * 3. Sorts results by voucher ID ascending
   * 4. Returns paginated voucher data
   * 5. Logs successful retrieval
   *
   * @param {number} userId - The user ID (creator) to retrieve vouchers for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of vouchers per page
   *
   * @returns {Promise<Vouchers[] | []>} Array of vouchers or empty array:
   *   - Voucher ID, code, discount amount
   *   - Validity period (start/end dates)
   *   - Applicable products, categories, variants
   *   - Usage limits and current usage count
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If voucher retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by voucher ID in ascending order
   * - Returns empty array if user created no vouchers
   * - Only vouchers where createdBy = userId are included
   * - Used for staff/admin discount management
   */
  async getAllVouchersCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Vouchers[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Vouchers, Prisma.VouchersFindManyArgs>(
        this.prismaService.vouchers,
        { where: { createdBy: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        'Vouchers created by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving vouchers created by user', error);
      throw new BadRequestException(
        'Failed to retrieve vouchers created by user',
      );
    }
  }

  /**
   * Retrieves paginated products with variants and media created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries products where createByUserId matches user ID
   * 3. Includes product variants and their media files
   * 4. Sorts results by product ID ascending
   * 5. Formats media URLs to public HTTPS URLs for all variants
   * 6. Logs successful retrieval
   * 7. Returns paginated product data with formatted media
   *
   * @param {number} userId - The user ID (creator) to retrieve products for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of products per page
   *
   * @returns {Promise<ProductsWithProductVariantsAndTheirMedia[] | []>} Array of products:
   *   - Product ID, name, description, price, stock
   *   - Product variants (size, color, SKU, stock)
   *   - Variant media with formatted public HTTPS URLs
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If product retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by product ID in ascending order
   * - Returns empty array if user created no products
   * - All product variant media URLs are formatted to public HTTPS
   * - Used for admin/staff product management
   */
  async getAllProductsCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<ProductsWithProductVariantsAndTheirMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ProductsWithProductVariantsAndTheirMedia,
        Prisma.ProductsFindManyArgs
      >(
        this.prismaService.products,
        {
          include: {
            productVariants: {
              include: {
                media: true,
              },
            },
          },
          where: { createByUserId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const products = result.data;
      for (let i = 0; i < products.length; i++) {
        const productVariants = products[i].productVariants;
        for (let j = 0; j < productVariants.length; j++) {
          productVariants[j].media = formatMediaFieldWithLogging(
            productVariants[j].media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'product variant',
            productVariants[j].id,
            this.logger,
          );
        }
      }

      this.logger.log(
        'Products created by user retrieved successfully',
        userId,
      );
      return products;
    } catch (error) {
      this.logger.log('Error retrieving products created by user', error);
      throw new BadRequestException(
        'Failed to retrieve products created by user',
      );
    }
  }

  /**
   * Retrieves paginated product variants with media created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries product variants where createdBy matches user ID
   * 3. Includes media files for each variant
   * 4. Sorts results by variant ID ascending
   * 5. Formats media URLs to public HTTPS URLs
   * 6. Logs successful retrieval
   * 7. Returns paginated variant data with formatted media
   *
   * @param {number} userId - The user ID (creator) to retrieve variants for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of variants per page
   *
   * @returns {Promise<ProductVariantsWithMediaInformation[] | []>} Array of product variants:
   *   - Variant ID, product ID, size, color, SKU
   *   - Price, stock quantity, status
   *   - Media with formatted public HTTPS URLs
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If variant retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by variant ID in ascending order
   * - Returns empty array if user created no variants
   * - All variant media URLs are formatted to public HTTPS
   * - Used for admin/staff inventory management
   */
  async getAllProductVariantsCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<ProductVariantsWithMediaInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ProductVariantsWithMediaInformation,
        Prisma.ProductVariantsFindManyArgs
      >(
        this.prismaService.productVariants,
        {
          include: { media: true },
          where: { createByUserId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const productVariants = result.data;
      for (let i = 0; i < productVariants.length; i++) {
        productVariants[i].media = formatMediaFieldWithLogging(
          productVariants[i].media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          productVariants[i].id,
          this.logger,
        );
      }

      this.logger.log(
        'Product variants created by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log(
        'Error retrieving product variants created by user',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve product variants created by user',
      );
    }
  }

  /**
   * Retrieves paginated categories created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries categories where createByUserId matches user ID
   * 3. Sorts results by category ID ascending
   * 4. Returns paginated category data
   * 5. Logs successful retrieval
   *
   * @param {number} userId - The user ID (creator) to retrieve categories for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of categories per page
   *
   * @returns {Promise<Category[] | []>} Array of categories or empty array:
   *   - Category ID, name, description
   *   - Parent category reference
   *   - Slug, status, priority
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If category retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by category ID in ascending order
   * - Returns empty array if user created no categories
   * - Only categories where createByUserId = userId are included
   * - Used for admin/staff category management
   */
  async getAllCategoryCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Category[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Category, Prisma.CategoryFindManyArgs>(
        this.prismaService.category,
        { where: { createByUserId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        'Category created by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving category created by user', error);
      throw new BadRequestException(
        'Failed to retrieve category created by user',
      );
    }
  }

  /**
   * Retrieves paginated orders with full details created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders where userId matches creator
   * 3. Includes order items, shipments, payments, and requests
   * 4. Sorts results by order ID ascending
   * 5. Returns paginated order data with full relationships
   * 6. Logs successful retrieval
   *
   * @param {number} userId - The user ID (creator) to retrieve orders for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Array of orders:
   *   - Order ID, status, total amount, created date
   *   - Order items (products, quantities, prices)
   *   - Shipments (tracking, status, carrier)
   *   - Payments (method, status, transaction ID)
   *   - Requests (returns, exchanges, cancellations)
   *
   * @throws {BadRequestException} If order retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by order ID in ascending order
   * - Returns empty array if user created no orders
   * - Includes complete order information with all relationships
   * - Used for user order history and management
   */
  async getAllOrdersCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          where: { userId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const orders = result.data;
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        // convert user media field
        order.user.userMedia = formatMediaFieldWithLogging(
          order.user.userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          order.user.id,
          this.logger,
        );

        // convert staff process user media field
        if (order.processByStaff) {
          order.processByStaff.userMedia = formatMediaFieldWithLogging(
            order.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            order.processByStaff.id,
            this.logger,
          );
        }

        // convert product variant media field
        for (let j = 0; j < order.orderItems.length; j++) {
          order.orderItems[j].productVariant.media =
            formatMediaFieldWithLogging(
              order.orderItems[j].productVariant.media,
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              'product variant',
              order.orderItems[j].productVariant.id,
              this.logger,
            );
        }

        // convert request media field
        for (let k = 0; k < order.requests.length; k++) {
          // convert media field of request
          order.requests[k].media = formatMediaFieldWithLogging(
            order.requests[k].media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'request',
            order.requests[k].id,
            this.logger,
          );

          // convert processByStaff user media field of request
          const processByStaff = order.requests[k].processByStaff;
          if (processByStaff) {
            processByStaff.userMedia = formatMediaFieldWithLogging(
              processByStaff.userMedia,
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              'user',
              processByStaff.id,
              this.logger,
            );
          }
        }

        // convert shipment media field
        for (let l = 0; l < order.shipments.length; l++) {
          const processByStaff = order.shipments[l].processByStaff;
          if (processByStaff) {
            processByStaff.userMedia = formatMediaFieldWithLogging(
              processByStaff.userMedia,
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              'shipment',
              order.shipments[l].id,
              this.logger,
            );
          }
        }
      }

      this.logger.log('Orders created by user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving orders created by user', error);
      throw new BadRequestException(
        'Failed to retrieve orders created by user',
      );
    }
  }

  /**
   * Retrieves paginated orders processed by a specific staff user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries orders where processByStaffId matches user ID
   * 3. Includes all order relationships (items, shipments, payments, requests)
   * 4. Sorts results by order ID ascending
   * 5. Formats media URLs for users, product variants, and requests
   * 6. Logs successful retrieval
   * 7. Returns paginated order data with formatted media
   *
   * @param {number} userId - The staff user ID (processor) to retrieve orders for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of orders per page
   *
   * @returns {Promise<OrdersWithFullInformation[] | []>} Array of orders:
   *   - Order ID, status, total amount, created date
   *   - Customer user information with formatted avatar
   *   - Staff processor information with formatted avatar
   *   - Order items with product variant media (formatted HTTPS URLs)
   *   - Shipments with staff information
   *   - Payments with transaction details
   *   - Requests with media and staff information (formatted HTTPS URLs)
   *
   * @throws {BadRequestException} If order retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by order ID in ascending order
   * - Returns empty array if staff user processed no orders
   * - All media URLs (user avatars, variant media, request media) are formatted
   * - Used for staff/admin order management dashboard
   */
  async getAllOrdersProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<OrdersWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        OrdersWithFullInformation,
        Prisma.OrdersFindManyArgs
      >(
        this.prismaService.orders,
        {
          include: OrdersWithFullInformationInclude,
          where: { processByStaffId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const orders = result.data;
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        // convert user media field
        order.user.userMedia = formatMediaFieldWithLogging(
          order.user.userMedia,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'user',
          order.user.id,
          this.logger,
        );

        // convert staff process user media field
        if (order.processByStaff) {
          order.processByStaff.userMedia = formatMediaFieldWithLogging(
            order.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            order.processByStaff.id,
            this.logger,
          );
        }
        // convert product variant media field
        for (let j = 0; j < order.orderItems.length; j++) {
          order.orderItems[j].productVariant.media =
            formatMediaFieldWithLogging(
              order.orderItems[j].productVariant.media,
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              'product variant',
              order.orderItems[j].productVariant.id,
              this.logger,
            );
        }

        // convert request media field
        for (let k = 0; k < order.requests.length; k++) {
          // convert media field of request
          order.requests[k].media = formatMediaFieldWithLogging(
            order.requests[k].media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'request',
            order.requests[k].id,
            this.logger,
          );

          // convert processByStaff user media field of request
          const processByStaff = order.requests[k].processByStaff;
          if (processByStaff) {
            processByStaff.userMedia = formatMediaFieldWithLogging(
              processByStaff.userMedia,
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              'user',
              processByStaff.id,
              this.logger,
            );
          }
        }

        // convert shipment media field
        for (let l = 0; l < order.shipments.length; l++) {
          const processByStaff = order.shipments[l].processByStaff;
          if (processByStaff) {
            processByStaff.userMedia = formatMediaFieldWithLogging(
              processByStaff.userMedia,
              (url: string) => this.awsService.buildPublicMediaUrl(url),
              'shipment',
              order.shipments[l].id,
              this.logger,
            );
          }
        }
      }

      this.logger.log(
        'Orders processed by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving orders processed by user', error);
      throw new BadRequestException(
        'Failed to retrieve orders processed by user',
      );
    }
  }

  /**
   * Retrieves paginated shipments processed by a specific staff user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries shipments where processByStaffId matches user ID
   * 3. Includes order and staff user relationships
   * 4. Sorts results by shipment ID ascending
   * 5. Formats media URLs for staff user avatars
   * 6. Logs successful retrieval
   * 7. Returns paginated shipment data with formatted media
   *
   * @param {number} userId - The staff user ID (processor) to retrieve shipments for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of shipments per page
   *
   * @returns {Promise<ShipmentsWithProcessStaffInformation[] | []>} Array of shipments:
   *   - Shipment ID, order ID, tracking number
   *   - Shipment status, carrier, shipping address
   *   - Estimated/actual delivery dates
   *   - Staff processor information with formatted avatar URLs
   *   - Order details
   *
   * @throws {BadRequestException} If shipment retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by shipment ID in ascending order
   * - Returns empty array if staff user processed no shipments
   * - Staff avatar media URLs are formatted to public HTTPS
   * - Used for staff/admin shipment tracking dashboard
   */
  async getAllShipmentsProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Shipments[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Shipments, Prisma.ShipmentsFindManyArgs>(
        this.prismaService.shipments,
        { where: { processByStaffId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        'Shipments processed by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving shipments processed by user', error);
      throw new BadRequestException(
        'Failed to retrieve shipments processed by user',
      );
    }
  }

  /**
   * Retrieves paginated requests with media created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries requests where userId matches creator
   * 3. Includes request media and staff processor information
   * 4. Sorts results by request ID ascending
   * 5. Formats media URLs for both requests and staff avatars
   * 6. Logs successful retrieval
   * 7. Returns paginated request data with formatted media
   *
   * @param {number} userId - The user ID (creator) to retrieve requests for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of requests per page
   *
   * @returns {Promise<RequestsWithMedia[] | []>} Array of requests:
   *   - Request ID, type, status, description
   *   - Order ID, order item ID
   *   - Request media with formatted HTTPS URLs
   *   - Staff processor information with avatar URLs
   *   - Created/updated timestamps, resolution details
   *
   * @throws {BadRequestException} If request retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by request ID in ascending order
   * - Returns empty array if user created no requests
   * - All media URLs (request media, staff avatars) are formatted to HTTPS
   * - Used for user request tracking (returns, exchanges, complaints)
   */
  async getRequestsOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<RequestsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        RequestsWithMedia,
        Prisma.RequestsFindManyArgs
      >(
        this.prismaService.requests,
        {
          include: {
            media: true,
            processByStaff: {
              include: { userMedia: true },
            },
          },
          where: { userId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const requests = result.data;
      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        // convert media field
        request.media = formatMediaFieldWithLogging(
          request.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          request.id,
          this.logger,
        );

        // convert processByStaff user media field
        if (request.processByStaff) {
          request.processByStaff.userMedia = formatMediaFieldWithLogging(
            request.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            request.processByStaff.id,
            this.logger,
          );
        }
      }

      this.logger.log('Requests of user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving requests of user', error);
      throw new BadRequestException('Failed to retrieve requests of user');
    }
  }

  /**
   * Retrieves paginated requests processed by a specific staff user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries requests where processByStaffId matches user ID
   * 3. Includes request media and staff processor information
   * 4. Sorts results by request ID ascending
   * 5. Formats media URLs for both requests and staff avatars
   * 6. Logs successful retrieval
   * 7. Returns paginated request data with formatted media
   *
   * @param {number} userId - The staff user ID (processor) to retrieve requests for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of requests per page
   *
   * @returns {Promise<RequestsWithMedia[] | []>} Array of requests:
   *   - Request ID, type, status, description
   *   - Customer user ID, order ID, order item ID
   *   - Request media with formatted HTTPS URLs
   *   - Staff processor information with avatar URLs
   *   - Resolution details, created/updated timestamps
   *
   * @throws {BadRequestException} If request retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by request ID in ascending order
   * - Returns empty array if staff user processed no requests
   * - All media URLs (request media, staff avatars) are formatted to HTTPS
   * - Used for staff/admin request management dashboard
   */
  async getRequestsProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<RequestsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        RequestsWithMedia,
        Prisma.RequestsFindManyArgs
      >(
        this.prismaService.requests,
        {
          include: {
            media: true,
            processByStaff: { include: { userMedia: true } },
          },
          where: { processByStaffId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const requests = result.data;
      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        // convert media field
        request.media = formatMediaFieldWithLogging(
          request.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'request',
          request.id,
          this.logger,
        );

        // convert processByStaff user media field
        if (request.processByStaff) {
          request.processByStaff.userMedia = formatMediaFieldWithLogging(
            request.processByStaff.userMedia,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'user',
            request.processByStaff.id,
            this.logger,
          );
        }
      }

      this.logger.log(
        'Requests processed by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving requests processed by user', error);
      throw new BadRequestException(
        'Failed to retrieve requests processed by user',
      );
    }
  }

  /**
   * Retrieves paginated size profiles for a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries size profiles where userId matches user ID
   * 3. Sorts results by profile ID ascending
   * 4. Returns paginated size profile data
   * 5. Logs successful retrieval
   *
   * @param {number} userId - The user ID to retrieve size profiles for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of size profiles per page
   *
   * @returns {Promise<SizeProfiles[] | []>} Array of size profiles or empty array:
   *   - Size profile ID, user ID
   *   - Height, weight, measurements
   *   - Size preferences (shirt, pants, shoes)
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If size profile retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by profile ID in ascending order
   * - Returns empty array if user has no size profiles
   * - Used for user size preference management and product recommendations
   */
  async getSizeProfilesOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<SizeProfiles[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        SizeProfiles,
        Prisma.SizeProfilesFindManyArgs
      >(
        this.prismaService.sizeProfiles,
        { where: { userId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Size profiles of user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving size profiles of user', error);
      throw new BadRequestException('Failed to retrieve size profiles of user');
    }
  }

  /**
   * Retrieves paginated reviews with media created by a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries reviews where userId matches user ID
   * 3. Includes review media files
   * 4. Sorts results by review ID ascending
   * 5. Formats media URLs to public HTTPS URLs
   * 6. Logs successful retrieval
   * 7. Returns paginated review data with formatted media
   *
   * @param {number} userId - The user ID to retrieve reviews for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of reviews per page
   *
   * @returns {Promise<ReviewsWithMedia[] | []>} Array of reviews or empty array:
   *   - Review ID, user ID, product ID, product variant ID
   *   - Rating, comment, title
   *   - Review media with formatted HTTPS URLs (images, videos)
   *   - Helpful count, verified purchase status
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If review retrieval or media formatting fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by review ID in ascending order
   * - Returns empty array if user has no reviews
   * - All review media URLs are formatted to public HTTPS
   * - Used for user review history and profile display
   */
  async getReviewsOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<ReviewsWithMedia[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ReviewsWithMedia,
        Prisma.ReviewsFindManyArgs
      >(
        this.prismaService.reviews,
        {
          include: { media: true },
          where: { userId: userId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate full http url for media files
      const reviews = result.data;
      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        // convert media field
        review.media = formatMediaFieldWithLogging(
          review.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'review',
          review.id,
          this.logger,
        );
      }

      this.logger.log('Reviews of user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving reviews of user', error);
      throw new BadRequestException('Failed to retrieve reviews of user');
    }
  }

  /**
   * Creates a new empty shopping cart for a user.
   *
   * This method performs the following operations:
   * 1. Creates new cart record in database
   * 2. Logs successful cart creation
   * 3. Returns created cart information
   *
   * @param {CreateCartDto} createCartDto - The cart creation data containing:
   *   - userId (required)
   *   - any additional cart metadata
   *
   * @returns {Promise<Cart>} The created cart with details:
   *   - Cart ID, user ID
   *   - Created/updated timestamps
   *   - Cart status and metadata
   *
   * @throws {BadRequestException} If cart creation fails
   *
   * @remarks
   * - Creates empty cart without any items
   * - Each user typically has one active cart
   * - Cart items are added separately using AddANewCart method
   * - Used during user registration or first product addition
   */
  async createANewCart(createCartDto: CreateCartDto): Promise<Cart> {
    try {
      const result = await this.prismaService.cart.create({
        data: { ...createCartDto },
      });

      this.logger.log('New cart created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating new cart', error);
      throw new BadRequestException('Failed to create new cart');
    }
  }

  /**
   * Adds a product variant to user cart or updates quantity if already exists.
   *
   * This method performs the following operations:
   * 1. Checks if product variant already exists in cart
   * 2. If exists: updates quantity by adding new quantity to existing
   * 3. If not exists: creates new cart item
   * 4. Retrieves full cart details with formatted media URLs
   * 5. Logs successful cart item addition/update
   * 6. Returns complete cart information
   *
   * @param {CreateCartItemDto} createCartItemDto - The cart item data containing:
   *   - cartId (cart ID)
   *   - productVariantId (product variant to add)
   *   - quantity (number of items to add)
   *
   * @returns {Promise<UserCartDetailInformation>} Complete cart details:
   *   - Cart ID, user ID
   *   - Cart items with product variant information
   *   - Product media with formatted HTTPS URLs
   *   - Total quantity and price calculations
   *
   * @throws {BadRequestException} If cart item addition or retrieval fails
   *
   * @remarks
   * - Operation runs in database transaction for data consistency
   * - Automatically updates quantity if item already in cart
   * - Creates new cart item if product not yet in cart
   * - All product variant media URLs are formatted to public HTTPS
   * - Used for "Add to Cart" functionality
   */
  async AddANewCart(
    createCartItemDto: CreateCartItemDto,
  ): Promise<UserCartDetailInformation> {
    try {
      this.logger.log(
        'Adding new cart item',
        createCartItemDto.productVariantId,
      );
      return this.prismaService.$transaction(async (tx) => {
        let existCartItem = await tx.cartItems.findFirst({
          where: {
            cartId: createCartItemDto.cartId,
            productVariantId: createCartItemDto.productVariantId,
          },
        });

        if (existCartItem) {
          existCartItem = await tx.cartItems.update({
            where: { id: existCartItem.id },
            data: {
              quantity:
                Number(existCartItem.quantity) +
                Number(createCartItemDto.quantity),
            },
          });
        } else {
          createCartItemDto.quantity = Number(createCartItemDto.quantity);
          const newCartItem = await tx.cartItems.create({
            data: { ...createCartItemDto },
          });

          if (!newCartItem) {
            throw new BadRequestException('Failed to add new cart item');
          }
        }

        const result = await tx.cart.findFirst({
          where: { id: createCartItemDto.cartId },
          include: {
            cartItems: {
              include: {
                productVariant: {
                  include: {
                    media: true,
                  },
                },
              },
            },
          },
        });

        if (!result) {
          throw new NotFoundException('Cart not found!');
        }

        // generate full http url for media files
        const cartItems = result.cartItems;
        for (let i = 0; i < cartItems.length; i++) {
          cartItems[i].productVariant.media = formatMediaFieldWithLogging(
            cartItems[i].productVariant.media,
            (url: string) => this.awsService.buildPublicMediaUrl(url),
            'product variant',
            cartItems[i].productVariant.id,
            this.logger,
          );
        }

        return result;
      });
    } catch (error) {
      this.logger.log('Error adding new cart item', error);
      throw new BadRequestException('Failed to add new cart item');
    }
  }

  /**
   * Retrieves the cart ID and information for a specific user.
   *
   * This method performs the following operations:
   * 1. Finds the first cart associated with user ID
   * 2. Sorts by cart ID ascending (returns oldest cart)
   * 3. Validates cart exists
   * 4. Logs successful retrieval
   * 5. Returns cart information
   *
   * @param {number} userId - The user ID to retrieve cart for
   *
   * @returns {Promise<Cart>} The cart details including:
   *   - Cart ID, user ID
   *   - Created/updated timestamps
   *   - Cart status and metadata
   *
   * @throws {NotFoundException} If cart not found for user
   * @throws {BadRequestException} If cart retrieval fails
   *
   * @remarks
   * - Returns first cart sorted by ID ascending
   * - Users typically have only one active cart
   * - Used to retrieve cart ID before adding items
   * - Does not include cart items; use getUserCartDetails for full cart
   */
  async getCartIdOfUser(userId: number): Promise<Cart> {
    try {
      const result = await this.prismaService.cart.findFirst({
        where: { userId: userId },
        orderBy: { id: 'asc' },
      });

      if (!result) {
        throw new NotFoundException('Cart not found!');
      }

      this.logger.log('Cart of user retrieved successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving cart of user', error);
      throw new BadRequestException('Failed to retrieve cart of user');
    }
  }

  /**
   * Updates cart information for a specific user.
   *
   * This method performs the following operations:
   * 1. Finds cart by user ID
   * 2. Updates cart with provided data
   * 3. Logs successful update
   * 4. Returns updated cart information
   *
   * @param {number} id - The user ID whose cart to update
   * @param {UpdateCartDto} updateCartDto - The cart update data containing:
   *   - Cart metadata fields to update
   *   - Status, notes, or other cart properties
   *
   * @returns {Promise<Cart>} The updated cart with details:
   *   - Cart ID, user ID
   *   - Updated timestamps and fields
   *   - Cart status and metadata
   *
   * @throws {BadRequestException} If cart update fails
   * @throws {NotFoundException} If cart not found for user
   *
   * @remarks
   * - Updates cart metadata, not cart items
   * - Cart items are updated separately through AddANewCart
   * - Used for cart status or metadata updates
   * - Does not return cart items; use getUserCartDetails for full cart
   */
  async updateUserCart(
    id: number,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    try {
      const result = await this.prismaService.cart.update({
        where: { userId: id },
        data: { ...updateCartDto },
      });

      this.logger.log('Cart updated successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error updating cart', error);
      throw new BadRequestException('Failed to update cart');
    }
  }

  /**
   * Retrieves complete cart details with items and product information for a user.
   *
   * This method performs the following operations:
   * 1. Finds cart by user ID
   * 2. Includes cart items with product variants and media
   * 3. Validates cart exists
   * 4. Formats product variant media URLs to public HTTPS
   * 5. Logs successful retrieval
   * 6. Returns complete cart information
   *
   * @param {number} id - The user ID to retrieve cart details for
   *
   * @returns {Promise<UserCartDetailInformation | null>} Complete cart details:
   *   - Cart ID, user ID
   *   - Cart items with quantities
   *   - Product variant details (SKU, size, color, price, stock)
   *   - Product media with formatted HTTPS URLs
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If cart not found for user
   * @throws {BadRequestException} If cart retrieval or media formatting fails
   *
   * @remarks
   * - Returns complete cart with all items and product information
   * - All product variant media URLs are formatted to public HTTPS
   * - Used for cart display and checkout process
   * - Includes all necessary product details for cart operations
   */
  async getUserCartDetails(
    id: number,
  ): Promise<UserCartDetailInformation | null> {
    try {
      const result = await this.prismaService.cart.findFirst({
        where: { userId: id },
        include: {
          cartItems: {
            include: {
              productVariant: {
                include: {
                  media: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundException('Cart detail not found!');
      }

      // generate full http url for media files
      const cartItems = result.cartItems;
      for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].productVariant.media = formatMediaFieldWithLogging(
          cartItems[i].productVariant.media,
          (url: string) => this.awsService.buildPublicMediaUrl(url),
          'product variant',
          cartItems[i].productVariant.id,
          this.logger,
        );
      }

      this.logger.log('Cart details retrieved successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving cart details', error);
      throw new BadRequestException('Failed to retrieve cart details');
    }
  }

  /**
   * Retrieves paginated saved vouchers for a specific user.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries user vouchers where userId matches and status is SAVED
   * 3. Includes full voucher details
   * 4. Sorts results by user voucher ID ascending
   * 5. Returns paginated voucher data
   * 6. Logs successful retrieval
   *
   * @param {number} userId - The user ID to retrieve saved vouchers for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of vouchers per page
   *
   * @returns {Promise<UserVoucherDetailInformation[] | []>} Array of saved vouchers:
   *   - User voucher ID, user ID, voucher ID
   *   - Voucher status (SAVED)
   *   - Voucher details (code, discount, validity period)
   *   - Usage restrictions and conditions
   *   - Created/saved timestamps
   *
   * @throws {BadRequestException} If voucher retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by user voucher ID in ascending order
   * - Returns only vouchers with SAVED status (not used/expired)
   * - Returns empty array if user has no saved vouchers
   * - Used for displaying user's available vouchers at checkout
   */
  async getSavedVouchersOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<UserVoucherDetailInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        UserVoucherDetailInformation,
        Prisma.UserVouchersFindManyArgs
      >(
        this.prismaService.userVouchers,
        {
          where: { userId: userId, voucherStatus: 'SAVED' },
          include: {
            voucher: true,
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log('Saved vouchers of user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving saved vouchers of user', error);
      throw new BadRequestException(
        'Failed to retrieve saved vouchers of user',
      );
    }
  }
}
