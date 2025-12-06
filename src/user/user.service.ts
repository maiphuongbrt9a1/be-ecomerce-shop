import {
  BadRequestException,
  Injectable,
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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly awsService: AwsS3Service,
  ) {}

  // Get the list of all User
  async getAllUser(page: number, perPage: number): Promise<User[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<User, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      { orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  // Get an User by id
  async getUserDetail(id: number): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return user;
  }

  // Get an User by email
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return user;
  }

  // Get an User by phone
  async getUserByPhone(phone: string): Promise<User | null> {
    const User = await this.prismaService.user.findFirst({
      where: {
        phone: phone,
      },
    });

    if (!User) {
      throw new NotFoundException('User not found!');
    }

    return User;
  }

  // Get an User by username
  async getUserByUserName(username: string): Promise<User | null> {
    const User = await this.prismaService.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!User) {
      throw new NotFoundException('User not found!');
    }

    return User;
  }

  // Create an User
  async createAnUser(
    file: Express.Multer.File,
    data: CreateUserDto,
  ): Promise<User> {
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

    return newUser;
  }

  // Create an User
  async createAnUserByGoogleAccount(
    data: CreateUserByGoogleAccountDto,
  ): Promise<User> {
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

    return newUser;
  }

  // Delete an User
  async deleteAnUser(id: number): Promise<User> {
    return this.prismaService.user.delete({ where: { id: id } });
  }

  // Update an User
  async updateAnUser(id: number, data: UpdateUserDto): Promise<User> {
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

    return updatedUser;
  }

  async handleRegister(registerDto: CreateAuthDto): Promise<User> {
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

    return user;
  }

  async handleActive(data: CodeAuthDto) {
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

      return userAfterUpdate;
    } else {
      throw new BadRequestException('Code active is expired or invalid');
    }
  }

  async retryActive(email: string) {
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

    return userAfterUpdate;
  }

  async retryPassword(email: string) {
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

    return userAfterUpdate;
  }

  async changePassword(data: ChangePasswordAuthDto) {
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

      return userAfterUpdate;
    } else {
      throw new BadRequestException(
        'Activation code is invalid or has expired',
      );
    }
  }

  async getAddressOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Address[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Address, Prisma.AddressFindManyArgs>(
      this.prismaService.address,
      { where: { userId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getShopOfficeOfUser(userId: number): Promise<ShopOfficeWithStaffs> {
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

    return shopInformation;
  }

  async getAvatarOfUser(userId: number): Promise<string> {
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

    return mediaInformation.url;
  }

  async getAllVouchersCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Vouchers[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Vouchers, Prisma.VouchersFindManyArgs>(
      this.prismaService.vouchers,
      { where: { createdBy: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllProductsCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
      this.prismaService.products,
      { where: { createByUserId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllProductVariantsCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<ProductVariants[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<
      ProductVariants,
      Prisma.ProductVariantsFindManyArgs
    >(
      this.prismaService.productVariants,
      { where: { createByUserId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllCategoryCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Category[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Category, Prisma.CategoryFindManyArgs>(
      this.prismaService.category,
      { where: { createByUserId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllOrdersCreatedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Orders[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
      this.prismaService.orders,
      { where: { userId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllOrdersProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Orders[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Orders, Prisma.OrdersFindManyArgs>(
      this.prismaService.orders,
      { where: { processByStaffId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getAllShipmentsProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Shipments[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Shipments, Prisma.ShipmentsFindManyArgs>(
      this.prismaService.shipments,
      { where: { processByStaffId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getRequestsOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Requests[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Requests, Prisma.RequestsFindManyArgs>(
      this.prismaService.requests,
      { where: { userId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getRequestsProcessedByUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Requests[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Requests, Prisma.RequestsFindManyArgs>(
      this.prismaService.requests,
      { where: { processByStaffId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getSizeProfilesOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<SizeProfiles[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<
      SizeProfiles,
      Prisma.SizeProfilesFindManyArgs
    >(
      this.prismaService.sizeProfiles,
      { where: { userId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async getReviewsOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<Reviews[] | []> {
    const paginate = createPaginator({ perPage: perPage });
    const result = await paginate<Reviews, Prisma.ReviewsFindManyArgs>(
      this.prismaService.reviews,
      { where: { userId: userId }, orderBy: { id: 'asc' } },
      { page: page },
    );

    return result.data;
  }

  async createANewCart(createCartDto: CreateCartDto): Promise<Cart> {
    const result = await this.prismaService.cart.create({
      data: { ...createCartDto },
    });

    return result;
  }

  async AddANewCart(
    createCartItemDto: CreateCartItemDto,
  ): Promise<UserCartDetailInformation> {
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
  }

  async getCartIdOfUser(userId: number): Promise<Cart> {
    const result = await this.prismaService.cart.findFirst({
      where: { userId: userId },
      orderBy: { id: 'asc' },
    });

    if (!result) {
      throw new NotFoundException('Cart not found!');
    }

    return result;
  }

  async updateUserCart(
    id: number,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    const result = await this.prismaService.cart.update({
      where: { userId: id },
      data: { ...updateCartDto },
    });
    return result;
  }

  async getUserCartDetails(
    id: number,
  ): Promise<UserCartDetailInformation | null> {
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

    return result;
  }

  async getSavedVouchersOfUser(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<UserVoucherDetailInformation[] | []> {
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

    return result.data;
  }
}
