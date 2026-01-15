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
  Products,
  ProductVariants,
  Category,
  Orders,
  Shipments,
  Requests,
  SizeProfiles,
  Reviews,
  Cart,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateUserByGoogleAccountDto,
  CreateUserDto,
} from '@/user/dtos/create.user.dto';
import { UpdateUserDto } from '@/user/dtos/update.user.dto';
import { v4 as uuidv4 } from 'uuid';
import { hashPasswordHelper } from '@/helpers/utils';
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
  ShopOfficeWithStaffs,
  UserCartDetailInformation,
  UserVoucherDetailInformation,
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

  // Get the list of all User
  async getAllUser(page: number, perPage: number): Promise<User[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<User, Prisma.UserFindManyArgs>(
        this.prismaService.user,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Users retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving users', error);
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  // Get an User by id
  async getUserDetail(id: number): Promise<User | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      this.logger.log('User retrieved successfully', id);
      return user;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  // Get an User by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      this.logger.log('User retrieved successfully', email);
      return user;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  // Get an User by phone
  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const User = await this.prismaService.user.findFirst({
        where: {
          phone: phone,
        },
      });

      if (!User) {
        throw new NotFoundException('User not found!');
      }

      this.logger.log('User retrieved successfully', phone);
      return User;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  // Get an User by username
  async getUserByUserName(username: string): Promise<User | null> {
    try {
      const User = await this.prismaService.user.findFirst({
        where: {
          username: username,
        },
      });

      if (!User) {
        throw new NotFoundException('User not found!');
      }

      this.logger.log('User retrieved successfully', username);
      return User;
    } catch (error) {
      this.logger.log('Error retrieving user', error);
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  // Create an User
  async createAnUser(
    file: Express.Multer.File,
    data: CreateUserDto,
  ): Promise<User> {
    try {
      const { firstName, lastName, email, phone, password, username, role } =
        data;

      const hashPassword = await hashPasswordHelper(password);
      if (!hashPassword) {
        throw new Error('Hash password for create user failed!');
      }

      const newUser = await this.prismaService.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashPassword,
          username,
          role: role ?? Role.USER,
          createdAt: new Date(Date.now()),
          isActive: false,
          codeActive: uuidv4().toString(),
          codeActiveExpire: new Date(Date.now() + 5 * 60 * 1000),
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

      this.logger.log('User created successfully', newUser.id);
      return newUser;
    } catch (error) {
      this.logger.log('Error creating user', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  // Create an User
  async createAnUserByGoogleAccount(
    data: CreateUserByGoogleAccountDto,
  ): Promise<User> {
    try {
      const { firstName, lastName, email, phone, googleId, username, role } =
        data;

      const newUser = await this.prismaService.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          googleId: googleId,
          username,
          role: role ?? Role.USER,
          createdAt: new Date(Date.now()),
          isActive: false,
          codeActive: uuidv4().toString(),
          codeActiveExpire: new Date(Date.now() + 5 * 60 * 1000),
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

  // Delete an User
  async deleteAnUser(id: number): Promise<User> {
    try {
      this.logger.log('User deleted successfully', id);
      return this.prismaService.user.delete({ where: { id: id } });
    } catch (error) {
      this.logger.log('Error deleting user', error);
      throw new BadRequestException('Failed to delete user');
    }
  }

  // Update an User
  async updateAnUser(id: number, data: UpdateUserDto): Promise<User> {
    try {
      const { firstName, lastName, gender, email, phone, password, username } =
        data;

      // Build update payload without password first
      const updateData: Prisma.UserUpdateInput = {
        firstName,
        lastName,
        gender,
        email,
        phone,
        username,
        updatedAt: new Date(Date.now()),
      };

      if (password && password.trim().length > 0) {
        const hashed = await hashPasswordHelper(password);
        if (!hashed) {
          throw new Error('Hash password for update user failed!');
        }
        updateData.password = hashed;
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: updateData,
      });

      this.logger.log('User updated successfully', id);
      return updatedUser;
    } catch (error) {
      this.logger.log('Error updating user', error);
      throw new BadRequestException('Failed to update user');
    }
  }

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

  async getShopOfficeOfUser(userId: number): Promise<ShopOfficeWithStaffs> {
    try {
      const shopInformation = await this.prismaService.shopOffice.findFirst({
        include: {
          staffs: {
            where: {
              id: userId,
            },
          },
        },
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

  async getAvatarOfUser(userId: number): Promise<string> {
    try {
      const mediaInformation = await this.prismaService.media.findFirst({
        where: {
          userId: userId,
          reviewId: null,
          productVariantId: null,
        },
        orderBy: { id: 'desc' },
      });

      if (!mediaInformation) {
        throw new NotFoundException('User avatar not found!');
      }

      this.logger.log('User avatar retrieved successfully', userId);
      return mediaInformation.url;
    } catch (error) {
      this.logger.log('Error retrieving user avatar', error);
      throw new BadRequestException('Failed to retrieve user avatar');
    }
  }

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

  async getAllProductsCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
        this.prismaService.products,
        { where: { createByUserId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        'Products created by user retrieved successfully',
        userId,
      );
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving products created by user', error);
      throw new BadRequestException(
        'Failed to retrieve products created by user',
      );
    }
  }

  async getAllProductVariantsCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<ProductVariants[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ProductVariants,
        Prisma.ProductVariantsFindManyArgs
      >(
        this.prismaService.productVariants,
        { where: { createByUserId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

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

  async getAllOrdersCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Orders[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
        this.prismaService.orders,
        { where: { userId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Orders created by user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving orders created by user', error);
      throw new BadRequestException(
        'Failed to retrieve orders created by user',
      );
    }
  }

  async getAllOrdersProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Orders[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
        this.prismaService.orders,
        { where: { processByStaffId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

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

  async getRequestsOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Requests[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Requests, Prisma.RequestsFindManyArgs>(
        this.prismaService.requests,
        { where: { userId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Requests of user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving requests of user', error);
      throw new BadRequestException('Failed to retrieve requests of user');
    }
  }

  async getRequestsProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Requests[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Requests, Prisma.RequestsFindManyArgs>(
        this.prismaService.requests,
        { where: { processByStaffId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

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

  async getReviewsOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Reviews[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
        this.prismaService.reviews,
        { where: { userId: userId }, orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Reviews of user retrieved successfully', userId);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving reviews of user', error);
      throw new BadRequestException('Failed to retrieve reviews of user');
    }
  }

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

        return result;
      });
    } catch (error) {
      this.logger.log('Error adding new cart item', error);
      throw new BadRequestException('Failed to add new cart item');
    }
  }

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

      this.logger.log('Cart details retrieved successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving cart details', error);
      throw new BadRequestException('Failed to retrieve cart details');
    }
  }

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
