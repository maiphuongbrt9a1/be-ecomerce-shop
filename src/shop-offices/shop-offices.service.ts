import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopOfficeDto } from './dto/create-shop-office.dto';
import { UpdateShopOfficeDto } from './dto/update-shop-office.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Address,
  Category,
  Prisma,
  Products,
  ShopOffice,
  User,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import {
  GHNShopDetail,
  MyGHNShopRegisterResponse,
  ProductsOfCategoryOfShopOffice,
} from '@/helpers/types/types';
import { GHNShops } from '@/helpers/utils';
import Ghn from 'giaohangnhanh';
import { GhnProvince, GhnDistrict, GhnWard } from '@/helpers/types/ghn-address';

@Injectable()
export class ShopOfficesService {
  private readonly logger = new Logger(ShopOfficesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new shop office location.
   *
   * This method performs the following operations:
   * 1. Creates shop office record in database
   * 2. Logs successful creation
   * 3. Returns created shop office
   *
   * @param {CreateShopOfficeDto} createShopOfficeDto - The shop office data containing:
   *   - name, location, address
   *   - Contact information (phone, email)
   *   - Operating hours, capacity
   *
   * @returns {Promise<ShopOffice>} The created shop office with details:
   *   - Shop office ID, name, location
   *   - Address and contact details
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If shop office creation fails
   *
   * @remarks
   * - Used for multi-location e-commerce businesses
   * - Shop offices manage inventory and staff
   * - Each office can have its own product catalog
   */
  async create(createShopOfficeDto: CreateShopOfficeDto): Promise<ShopOffice> {
    try {
      const defaultGhnConfig = {
        token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
        shopId: Number(process.env.GHN_SHOP1_ID!),
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
      };

      const ghn = new Ghn(defaultGhnConfig);
      const ghnShops = new GHNShops(defaultGhnConfig);

      // Lấy danh sách các tỉnh
      const GHNProvinces = await ghn.address.getProvinces();
      // tìm tỉnh ứng với tỉnh của người khách hàng cung cấp
      const candidateProvince = GHNProvinces.filter(
        (p) =>
          Array.isArray(p.NameExtension) &&
          p.IsEnable === 1 &&
          p.Status === 1 &&
          p.NameExtension.some((name) =>
            name?.includes(createShopOfficeDto.province),
          ),
      );

      if (!candidateProvince || candidateProvince.length === 0) {
        this.logger.log(`Province ${createShopOfficeDto.province} not found`);
        throw new NotFoundException(
          `Province ${createShopOfficeDto.province} not found`,
        );
      }

      let shopProvince: GhnProvince | undefined;
      let shopDistrict: GhnDistrict | undefined;
      let shopWard: GhnWard | undefined;

      for (const province of candidateProvince) {
        // Lấy danh sách quận/huyện trong tỉnh đó
        const districtsOfProvince = await ghn.address.getDistricts(
          province.ProvinceID,
        );

        if (!districtsOfProvince || districtsOfProvince.length === 0) {
          continue; // nếu không có quận/huyện nào trong tỉnh này, tiếp tục kiểm tra tỉnh tiếp theo
        }

        // tìm quận/huyện ứng với quận/huyện được cung cấp
        shopDistrict = districtsOfProvince.find(
          (d) =>
            Array.isArray(d.NameExtension) &&
            d.NameExtension.some((name) =>
              name?.includes(createShopOfficeDto.district),
            ),
        );

        if (!shopDistrict) {
          continue; // nếu không tìm thấy quận/huyện trong tỉnh này, tiếp tục kiểm tra tỉnh tiếp theo
        }

        // Lấy danh sách phường/xã trong quận/huyện đó
        const wardsOfDistrict = await ghn.address.getWards(
          shopDistrict.DistrictID,
        );

        if (!wardsOfDistrict || wardsOfDistrict.length === 0) {
          continue; // nếu không có phường/xã nào trong quận/huyện này, tiếp tục kiểm tra tỉnh tiếp theo
        }

        // tìm phường/xã ứng với phường/xã được cung cấp
        shopWard = wardsOfDistrict.find(
          (w) =>
            Array.isArray(w.NameExtension) &&
            w.NameExtension.some((name) =>
              name?.includes(createShopOfficeDto.ward),
            ),
        );
        if (!shopWard) {
          continue; // nếu không tìm thấy phường/xã trong quận/huyện này, tiếp tục kiểm tra tỉnh tiếp theo
        }

        // nếu tìm thấy cả tỉnh, quận/huyện và phường/xã thì gán giá trị và thoát vòng lặp
        shopProvince = province;
        break;
      }

      if (!shopProvince || !shopDistrict || !shopWard) {
        this.logger.log(
          `Could not find complete address information for province: ${createShopOfficeDto.province}, district: ${createShopOfficeDto.district}, ward: ${createShopOfficeDto.ward}`,
        );
        throw new NotFoundException(
          `Could not find complete address information for province: ${createShopOfficeDto.province}, district: ${createShopOfficeDto.district}, ward: ${createShopOfficeDto.ward}`,
        );
      }

      const newGHNShop: MyGHNShopRegisterResponse =
        await ghnShops.registerGHNShopOffice(
          shopDistrict.DistrictID,
          shopWard.WardCode,
          createShopOfficeDto.shopName,
          createShopOfficeDto.phone,
          createShopOfficeDto.address,
        );

      if (!newGHNShop || newGHNShop.code !== 200) {
        this.logger.log('Failed to register shop office with GHN', newGHNShop);
        throw new BadRequestException(
          'Failed to register shop office with GHN',
        );
      }

      const result = await this.prismaService.shopOffice.create({
        data: {
          shopName: createShopOfficeDto.shopName,
          ghnShopProvinceId: shopProvince.ProvinceID,
          ghnShopDistrictId: shopDistrict.DistrictID,
          ghnShopWardCode: shopWard.WardCode,
          ghnShopId: newGHNShop.data.shop_id,
        },
      });

      this.logger.log('Shop office created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating shop office', error);
      throw new BadRequestException('Failed to create shop office');
    }
  }

  /**
   * Retrieves paginated list of all shop offices.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all shop offices from database
   * 3. Sorts results by shop office ID ascending
   * 4. Returns paginated shop office data
   * 5. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of shop offices per page
   *
   * @returns {Promise<ShopOffice[] | []>} Array of shop offices or empty array:
   *   - Shop office ID, name, location
   *   - Address and contact information
   *   - Operating hours, capacity
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If shop office retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by shop office ID in ascending order
   * - Returns empty array if no shop offices exist
   * - Used for admin shop office management
   */
  async findAll(page: number, perPage: number): Promise<ShopOffice[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<ShopOffice, Prisma.ShopOfficeFindManyArgs>(
        this.prismaService.shopOffice,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Shop offices retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving shop offices', error);
      throw new BadRequestException('Failed to retrieve shop offices');
    }
  }

  /**
   * Retrieves a single shop office by ID.
   *
   * This method performs the following operations:
   * 1. Queries shop office by ID
   * 2. Validates shop office exists
   * 3. Logs successful retrieval
   * 4. Returns shop office details
   *
   * @param {number} id - The shop office ID to retrieve
   *
   * @returns {Promise<ShopOffice | null>} The shop office with details:
   *   - Shop office ID, name, location
   *   - Address and contact information
   *   - Operating hours, capacity
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If shop office not found
   * @throws {BadRequestException} If shop office retrieval fails
   *
   * @remarks
   * - Returns null if shop office doesn't exist
   * - Used for viewing specific shop office details
   * - Includes all shop office information
   */
  async findOne(id: number): Promise<ShopOffice | null> {
    try {
      const result = await this.prismaService.shopOffice.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Shop office not found!');
      }

      this.logger.log('Shop office retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office', error);
      throw new BadRequestException('Failed to retrieve shop office');
    }
  }

  /**
   * Updates an existing shop office.
   *
   * This method performs the following operations:
   * 1. Updates shop office in database
   * 2. Logs successful update
   * 3. Returns updated shop office
   *
   * @param {number} id - The shop office ID to update
   * @param {UpdateShopOfficeDto} updateShopOfficeDto - The update data containing:
   *   - name, location, address (optional)
   *   - Contact information updates (optional)
   *   - Operating hours, capacity updates (optional)
   *
   * @returns {Promise<ShopOffice>} The updated shop office with all details
   *
   * @throws {BadRequestException} If shop office update fails
   * @throws {NotFoundException} If shop office not found
   *
   * @remarks
   * - Only provided fields are updated
   * - Updates timestamp automatically
   * - Used for shop office information maintenance
   */
  async update(
    id: number,
    updateShopOfficeDto: UpdateShopOfficeDto,
  ): Promise<ShopOffice> {
    try {
      const result = await this.prismaService.shopOffice.update({
        where: { id: id },
        data: { shopName: updateShopOfficeDto.shopName },
      });
      this.logger.log('Shop office updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating shop office', error);
      throw new BadRequestException('Failed to update shop office');
    }
  }

  /**
   * Deletes a shop office by ID.
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes shop office from database
   * 3. Returns deleted shop office
   *
   * @param {number} id - The shop office ID to delete
   *
   * @returns {Promise<ShopOffice>} The deleted shop office with all details
   *
   * @throws {BadRequestException} If shop office deletion fails
   * @throws {NotFoundException} If shop office not found
   *
   * @remarks
   * - This operation is irreversible
   * - May affect related products, staff, and inventory
   * - Database cascades handle related record cleanup
   * - Used when closing shop locations
   */
  async remove(id: number): Promise<ShopOffice> {
    try {
      this.logger.log('Shop office deleted successfully', id);
      return await this.prismaService.shopOffice.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting shop office', error);
      throw new BadRequestException('Failed to delete shop office');
    }
  }

  /**
   * Retrieves all managers (admins and operators) of a specific shop office.
   *
   * This method performs the following operations:
   * 1. Queries users assigned to shop office with ADMIN or OPERATOR roles
   * 2. Validates results exist
   * 3. Logs successful retrieval
   * 4. Returns list of manager users
   *
   * @param {number} id - The shop office ID to retrieve managers for
   *
   * @returns {Promise<User[] | []>} Array of manager users or empty array:
   *   - User ID, name, email, phone
   *   - Role (ADMIN or OPERATOR)
   *   - Staff code, contact information
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If no managers found
   * @throws {BadRequestException} If manager retrieval fails
   *
   * @remarks
   * - Returns only users with ADMIN or OPERATOR roles
   * - Used for shop office staff management
   * - Excludes regular staff and customers
   */
  async findAllManagersOfShopOffice(id: number): Promise<User[] | []> {
    try {
      const result = await this.prismaService.user.findMany({
        where: { shopOfficeId: id, role: { in: ['ADMIN', 'OPERATOR'] } },
      });

      if (!result) {
        throw new NotFoundException('Shop office managers not found!');
      }
      this.logger.log('Shop office managers retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office managers', error);
      throw new BadRequestException('Failed to retrieve shop office managers');
    }
  }

  /**
   * Retrieves the address of a specific shop office.
   *
   * This method performs the following operations:
   * 1. Queries address associated with shop office
   * 2. Validates address exists
   * 3. Logs successful retrieval
   * 4. Returns address details
   *
   * @param {number} id - The shop office ID to retrieve address for
   *
   * @returns {Promise<Address | null>} The shop office address with details:
   *   - Address ID, shop office ID
   *   - Street, ward, district, city, state
   *   - Postal code, country
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If shop office address not found
   * @throws {BadRequestException} If address retrieval fails
   *
   * @remarks
   * - Returns null if address doesn't exist
   * - Each shop office has one primary address
   * - Used for shipping, billing, and contact purposes
   */
  async findAddressOfShopOffice(id: number): Promise<Address | null> {
    try {
      const result = await this.prismaService.address.findFirst({
        where: { shopOfficeId: id },
      });

      if (!result) {
        throw new NotFoundException('Shop office address not found!');
      }

      this.logger.log('Shop office address retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office address', error);
      throw new BadRequestException('Failed to retrieve shop office address');
    }
  }

  /**
   * Retrieves paginated products for a specific shop office.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries products assigned to shop office
   * 3. Sorts results by product ID ascending
   * 4. Validates results exist
   * 5. Logs successful retrieval
   * 6. Returns paginated product data
   *
   * @param {number} id - The shop office ID to retrieve products for
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of products per page
   *
   * @returns {Promise<Products[] | []>} Array of products or empty array:
   *   - Product ID, name, description
   *   - Price, stock, category
   *   - Shop office assignment
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If shop office products not found
   * @throws {BadRequestException} If product retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by product ID in ascending order
   * - Returns empty array if shop office has no products
   * - Used for shop office inventory management
   */
  async findAllProductsOfShopOffice(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
        this.prismaService.products,
        { where: { shopOfficeId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      if (!result.data) {
        throw new NotFoundException('Shop office products is empty!');
      }

      this.logger.log('Shop office products retrieved successfully', id);
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving shop office products', error);
      throw new BadRequestException('Failed to retrieve shop office products');
    }
  }

  /**
   * Retrieves all categories for a specific shop office.
   *
   * This method performs the following operations:
   * 1. Queries categories assigned to shop office
   * 2. Validates results exist
   * 3. Logs successful retrieval
   * 4. Returns list of categories
   *
   * @param {number} id - The shop office ID to retrieve categories for
   *
   * @returns {Promise<Category[] | []>} Array of categories or empty array:
   *   - Category ID, name, description
   *   - Shop office assignment
   *   - Parent category reference
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If shop office categories not found
   * @throws {BadRequestException} If category retrieval fails
   *
   * @remarks
   * - Returns empty array if shop office has no categories
   * - Each shop office can manage its own category structure
   * - Used for shop office product organization
   */
  async findAllCategoryOfShopOffice(id: number): Promise<Category[] | []> {
    try {
      const result = await this.prismaService.category.findMany({
        where: { shopOfficeId: id },
      });

      if (!result) {
        throw new NotFoundException('Shop office categories is empty!');
      }

      this.logger.log('Shop office categories retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving shop office categories', error);
      throw new BadRequestException(
        'Failed to retrieve shop office categories',
      );
    }
  }

  /**
   * Retrieves paginated products of a specific category within a shop office.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries products matching both shop office and category
   * 3. Sorts results by shop office ID ascending
   * 4. Validates results exist
   * 5. Logs successful retrieval
   * 6. Returns paginated product data
   *
   * @param {number} shopId - The shop office ID
   * @param {number} categoryId - The category ID to filter products
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of products per page
   *
   * @returns {Promise<ProductsOfCategoryOfShopOffice[] | []>} Array of products:
   *   - Products belonging to specified category
   *   - Within specified shop office
   *   - Paginated results
   *
   * @throws {NotFoundException} If no products found for category in shop office
   * @throws {BadRequestException} If product retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Filters by both shop office and category
   * - Returns empty array if no matching products
   * - Used for category-specific inventory views per shop
   */
  async findAllProductsOfCategoryOfShopOffice(
    shopId: number,
    categoryId: number,
    page: number,
    perPage: number,
  ): Promise<ProductsOfCategoryOfShopOffice[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ProductsOfCategoryOfShopOffice,
        Prisma.ShopOfficeFindManyArgs
      >(
        this.prismaService.shopOffice,
        {
          select: {
            products: { where: { categoryId: categoryId } },
          },
          where: { id: shopId },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      if (!result.data) {
        throw new NotFoundException(
          'Shop office products of category is empty!',
        );
      }

      this.logger.log(
        'Shop office products of category retrieved successfully',
        shopId,
      );
      return result.data;
    } catch (error) {
      this.logger.log(
        'Error retrieving shop office products of category',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve shop office products of category',
      );
    }
  }

  async getGHNShopOffice(shopOfficeId: number): Promise<GHNShopDetail | null> {
    try {
      const shopOffice = await this.prismaService.shopOffice.findUnique({
        where: { id: shopOfficeId },
      });

      if (!shopOffice) {
        throw new NotFoundException('Shop office not found!');
      }

      if (!shopOffice.ghnShopId) {
        throw new NotFoundException('GHN shop office details not found!');
      }

      const ghnConfig = {
        token: process.env.GHN_TOKEN!, // Thay bằng token của bạn
        shopId: Number(shopOffice.ghnShopId), // Thay bằng shopId của bạn
        host: process.env.GHN_HOST!,
        trackingHost: process.env.GHN_TRACKING_HOST!,
        testMode: process.env.GHN_TEST_MODE === 'true', // Bật chế độ test sẽ ghi đè tất cả host thành môi trường sandbox
      };
      const ghnShops = new GHNShops(ghnConfig);

      const ghnShopOfficeList = await ghnShops.getShopList();
      const ghnShopOffice = ghnShops.getShopInfo(
        Number(shopOffice.ghnShopId),
        ghnShopOfficeList,
      );

      if (!ghnShopOffice) {
        throw new NotFoundException('GHN shop office details not found!');
      }

      this.logger.log(
        'GHN shop office details retrieved successfully',
        shopOfficeId,
      );

      return ghnShopOffice;
    } catch (error) {
      this.logger.log('Error retrieving GHN shop office details', error);
      throw new BadRequestException(
        'Failed to retrieve GHN shop office details',
      );
    }
  }
}
