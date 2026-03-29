import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Address, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import Ghn from 'giaohangnhanh';
import { GhnDistrict, GhnProvince, GhnWard } from '@/helpers/types/ghn-address';
import { createNewAddressForOrderResponseDto } from '@/helpers/types/types';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new address record for users or shop offices.
   *
   * This method performs the following operations:
   * 1. Creates address record in database
   * 2. Logs successful creation
   * 3. Returns created address details
   *
   * @param {CreateAddressDto} createAddressDto - The address data containing:
   *   - street, ward, district, city, country
   *   - postalCode, phoneNumber
   *   - userId (relationship)
   *   - isDefault (boolean)
   *
   * @returns {Promise<Address>} The created address with:
   *   - Address ID, full address components
   *   - Phone number, postal code
   *   - Related entity IDs
   *   - Created timestamp
   *
   * @throws {BadRequestException} If address creation fails
   *
   * @remarks
   * - Can be linked to users or shop offices
   * - Supports multiple addresses per entity
   * - isDefault flag for primary address selection
   * - Used during user registration and checkout
   */
  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    try {
      const address = await this.prismaService.address.create({
        data: { ...createAddressDto },
      });

      this.logger.log(`Address created with ID: ${address.id}`);
      return address;
    } catch (error) {
      this.logger.error('Failed to create address: ', error);
      throw new BadRequestException('Failed to create address');
    }
  }

  /**
   * Retrieves paginated list of all addresses.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all addresses from database
   * 3. Sorts results by address ID ascending
   * 4. Returns paginated address data
   * 5. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of addresses per page
   *
   * @returns {Promise<Address[] | []>} Array of addresses or empty array:
   *   - Address ID, full address components
   *   - Phone number, postal code
   *   - Related entity IDs (userId)
   *   - isDefault flag
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If address retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by address ID in ascending order
   * - Returns empty array if no addresses exist
   * - Used for admin address management
   */
  async findAll(page: number, perPage: number): Promise<Address[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Address, Prisma.AddressFindManyArgs>(
        this.prismaService.address,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all addresses - Page: ${page}, Per Page: ${perPage}`,
      );

      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all addresses: ', error);
      throw new BadRequestException('Failed to fetch all addresses');
    }
  }

  /**
   * Retrieves a single address by ID.
   *
   * This method performs the following operations:
   * 1. Queries address by ID
   * 2. Validates address exists
   * 3. Logs successful retrieval
   * 4. Returns address details
   *
   * @param {number} id - The address ID to retrieve
   *
   * @returns {Promise<Address | null>} The address with:
   *   - Address ID, full address components
   *   - Phone number, postal code
   *   - Related entity IDs
   *   - isDefault flag
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If address not found
   * @throws {BadRequestException} If address retrieval fails
   *
   * @remarks
   * - Returns null if address doesn't exist
   * - Used for displaying specific address details
   * - Used during checkout address selection
   */
  async findOne(id: number): Promise<Address | null> {
    try {
      const address = await this.prismaService.address.findFirst({
        where: { id: id },
      });

      if (!address) {
        throw new NotFoundException('Address not found!');
      }

      this.logger.log(`Fetched address with ID: ${id}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to fetch address with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch address');
    }
  }

  /**
   * Updates an existing address record.
   *
   * This method performs the following operations:
   * 1. Updates address in database
   * 2. Logs successful update
   * 3. Returns updated address
   *
   * @param {number} id - The address ID to update
   * @param {UpdateAddressDto} updateAddressDto - The update data containing:
   *   - street, ward, district, city, country (optional)
   *   - postalCode, phoneNumber (optional)
   *   - isDefault (optional)
   *
   * @returns {Promise<Address>} The updated address with all details
   *
   * @throws {BadRequestException} If address update fails
   * @throws {NotFoundException} If address not found
   *
   * @remarks
   * - Used to correct address information
   * - Can update default address flag
   * - Should validate only one default address per user/shop
   * - Used in user profile and checkout flows
   */
  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    try {
      const address = await this.prismaService.address.update({
        where: { id: id },
        data: { ...updateAddressDto },
      });

      this.logger.log(`Updated address with ID: ${id}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to update address with ID ${id}: `, error);
      throw new BadRequestException('Failed to update address');
    }
  }

  /**
   * Deletes an address by ID.
   *
   * This method performs the following operations:
   * 1. Deletes address from database
   * 2. Logs successful deletion
   * 3. Returns deleted address
   *
   * @param {number} id - The address ID to delete
   *
   * @returns {Promise<Address>} The deleted address with all details
   *
   * @throws {BadRequestException} If address deletion fails
   * @throws {NotFoundException} If address not found
   *
   * @remarks
   * - This operation is irreversible
   * - Should not delete if address is used in active orders
   * - Database cascades handle related record cleanup
   * - Used for address management in user profiles
   */
  async remove(id: number): Promise<Address> {
    try {
      const address = await this.prismaService.address.delete({
        where: { id: id },
      });

      this.logger.log(`Deleted address with ID: ${id}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to delete address with ID ${id}: `, error);
      throw new BadRequestException('Failed to delete address');
    }
  }

  /**
   * Creates a new address for order with GHN shipping validation.
   *
   * This method performs the following operations:
   * 1. Initializes GHN (Giao Hàng Nhanh) shipping service with environment configuration
   * 2. Retrieves all provinces from GHN system
   * 3. Filters and matches the customer's province against GHN provinces
   * 4. Iterates through matching provinces to find matching district
   * 5. For matched district, retrieves and matches customer's ward
   * 6. Creates address record in database with customer data
   * 7. Validates complete address information exists in GHN system
   * 8. Returns response containing both database address and GHN validated location data
   *
   * @param {CreateAddressDto} createAddressDto - The address data containing:
   *   - userId (optional): User ID if address belongs to a user
   *   - street: Street address
   *   - ward: Ward/commune name (must match GHN system)
   *   - district: District/town name (must match GHN system)
   *   - province: Province name (must match GHN system)
   *   - zipCode: Postal/zip code
   *   - country: Country name
   *   - createdAt (optional): Creation timestamp
   *   - updatedAt (optional): Update timestamp
   *
   * @returns {Promise<createNewAddressForOrderResponseDto>} Response object containing:
   *   - databaseAddress: The newly created Address record from database with:
   *     - id: Auto-generated address ID
   *     - userId, street, ward, district, province, zipCode, country
   *     - createdAt, updatedAt: Timestamp information
   *   - toProvince: GHN Province object with:
   *     - ProvinceID, ProvinceName, Code, RegionID, NameExtension
   *     - Status, IsEnable, and other GHN metadata
   *   - toDistrict: GHN District object with:
   *     - DistrictID, DistrictName, ProvinceID, PickType, DeliverType
   *     - CanUpdateCOD, SupportType, and other GHN shipping metadata
   *   - toWard: GHN Ward object with:
   *     - WardCode, WardName, DistrictID, PickType, DeliverType
   *     - CanUpdateCOD, SupportType, and other GHN shipping metadata
   *
   * @throws {NotFoundException} If:
   *   - Provided province is not found in GHN system
   *   - Provided district is not found in matched provinces
   *   - Provided ward is not found in matched districts
   *   - Complete address information cannot be matched in GHN system
   *
   * @throws {BadRequestException} If address creation in database fails
   *
   * @remarks
   * - Requires GHN_TOKEN, GHN_SHOP1_ID, GHN_HOST, GHN_TRACKING_HOST environment variables
   * - Uses fuzzy matching via NameExtension arrays (supports Vietnamese location aliases)
   * - Location names must match GHN system names (Vietnamese characters supported)
   * - Validates both database persistence and GHN shipping service availability
   * - Critical for order fulfillment as it obtains GHN IDs needed for shipment creation
   * - GHN validation ensures address is deliverable via Giao Hàng Nhanh service
   * - All three location levels (province, district, ward) must be found for success
   * - Supports test mode via GHN_TEST_MODE environment variable
   */
  async createNewAddressForOrder(
    createAddressDto: CreateAddressDto,
  ): Promise<createNewAddressForOrderResponseDto> {
    try {
      // Initialize GHN with environment configuration
      const ghnConfig = {
        token: process.env.GHN_TOKEN!, // GHN API authentication token
        shopId: Number(process.env.GHN_SHOP1_ID!), // Shop ID registered with GHN
        host: process.env.GHN_HOST!, // GHN API host URL
        trackingHost: process.env.GHN_TRACKING_HOST!, // GHN tracking service host
        testMode: process.env.GHN_TEST_MODE === 'true', // Enable test mode to use sandbox environment
      };
      const ghn = new Ghn(ghnConfig);

      // Retrieve all available provinces from GHN system
      const GHNProvinces = await ghn.address.getProvinces();

      // Filter provinces matching customer's input using fuzzy matching via NameExtension
      const candidateProvince = GHNProvinces.filter(
        (p) =>
          Array.isArray(p.NameExtension) &&
          p.IsEnable === 1 &&
          p.Status === 1 &&
          p.NameExtension.some((name) =>
            name?.includes(createAddressDto.province),
          ),
      );

      if (!candidateProvince || candidateProvince.length === 0) {
        this.logger.log(
          `Province ${createAddressDto.province} not found in GHN system`,
        );
        throw new NotFoundException(
          `Province ${createAddressDto.province} not found in GHN system`,
        );
      }

      let toProvince: GhnProvince | undefined;
      let toDistrict: GhnDistrict | undefined;
      let toWard: GhnWard | undefined;

      // Iterate through candidate provinces to find matching district and ward
      for (const province of candidateProvince) {
        // Retrieve all districts within this province from GHN system
        const districtsOfToProvince = await ghn.address.getDistricts(
          province.ProvinceID,
        );

        if (!districtsOfToProvince || districtsOfToProvince.length === 0) {
          // No districts found in this province, try next candidate
          continue;
        }

        // Find district matching customer's input using fuzzy matching
        toDistrict = districtsOfToProvince.find(
          (d) =>
            Array.isArray(d.NameExtension) &&
            d.IsEnable === 1 &&
            d.Status === 1 &&
            d.NameExtension.some((name) =>
              name?.includes(createAddressDto.district),
            ),
        );

        if (!toDistrict) {
          // District not found in this province, try next candidate province
          continue;
        }

        // Retrieve all wards/communes within this district from GHN system
        const wardsOfToDistrict = await ghn.address.getWards(
          toDistrict.DistrictID,
        );

        if (!wardsOfToDistrict || wardsOfToDistrict.length === 0) {
          // No wards found in this district, try next candidate province
          continue;
        }

        // Find ward matching customer's input using fuzzy matching
        toWard = wardsOfToDistrict.find(
          (w) =>
            Array.isArray(w.NameExtension) &&
            w.IsEnable === 1 &&
            w.Status === 1 &&
            w.NameExtension.some((name) =>
              name?.includes(createAddressDto.ward),
            ),
        );
        if (!toWard) {
          // Ward not found in this district, try next candidate province
          continue;
        }

        // Complete address hierarchy found, exit search loop
        toProvince = province;
        break;
      }

      // Validate that all three location levels were successfully matched
      if (!toProvince || !toDistrict || !toWard) {
        this.logger.log(
          `Could not find complete address information for province: ${createAddressDto.province}, district: ${createAddressDto.district}, ward: ${createAddressDto.ward} in GHN system`,
        );
        throw new NotFoundException(
          `Could not find complete address information for province: ${createAddressDto.province}, district: ${createAddressDto.district}, ward: ${createAddressDto.ward} in GHN system`,
        );
      }

      // Create new address record in database
      const address = await this.prismaService.address.create({
        data: {
          isOrderAddress: true, // Mark this address as an order address for filtering purposes
          ...createAddressDto,
        },
      });

      this.logger.log(`Address created in database with ID: ${address.id}`);

      // Construct response with database address and validated GHN location data
      const result: createNewAddressForOrderResponseDto = {
        orderAddressInDb: address,
        orderAddressInGHN: {
          toProvince: toProvince,
          toDistrict: toDistrict,
          toWard: toWard,
        },
      };

      this.logger.log(
        `Successfully created new address for order with ID: ${address.id} and matched GHN address - Province: ${toProvince.ProvinceName}, District: ${toDistrict.DistrictName}, Ward: ${toWard.WardName}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to create address for order: ', error);
      throw new BadRequestException('Failed to create address for order');
    }
  }
}
