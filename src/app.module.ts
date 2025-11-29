import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailModule } from './mail/mail.module';
import { TransformInterceptor } from './core/transform.interceptor';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { AddressModule } from './address/address.module';
import { SizeProfilesModule } from './size-profiles/size-profiles.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { PaymentsModule } from './payments/payments.module';
import { CartModule } from './cart/cart.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { UserVouchersModule } from './user-vouchers/user-vouchers.module';
import { RequestsModule } from './requests/requests.module';
import { ReturnRequestsModule } from './return-requests/return-requests.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { ShopOfficesModule } from './shop-offices/shop-offices.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: +configService.get<string>('MAIL_PORT')!,
          secure: true,
          pool: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        // preview: true,
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          // or new PugAdapter() or new EjsAdapter()
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    ProductsModule,
    CategoryModule,
    AddressModule,
    SizeProfilesModule,
    ProductVariantsModule,
    ReviewsModule,
    MediaModule,
    OrdersModule,
    OrderItemsModule,
    ShipmentsModule,
    PaymentsModule,
    CartModule,
    CartItemsModule,
    VouchersModule,
    UserVouchersModule,
    RequestsModule,
    ReturnRequestsModule,
    AwsS3Module,
    ShopOfficesModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
