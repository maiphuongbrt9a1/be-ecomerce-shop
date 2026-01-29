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
