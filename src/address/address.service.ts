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
   *   - userId or shopOfficeId (relationship)
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
   *   - Related entity IDs (userId, shopOfficeId)
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
}
