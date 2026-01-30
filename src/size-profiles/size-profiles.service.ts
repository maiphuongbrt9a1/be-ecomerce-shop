import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSizeProfileDto } from './dto/create-size-profile.dto';
import { UpdateSizeProfileDto } from './dto/update-size-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, SizeProfiles } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class SizeProfilesService {
  private readonly logger = new Logger(SizeProfilesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new size profile for a user.
   *
   * This method performs the following operations:
   * 1. Creates size profile record in database
   * 2. Logs successful creation
   * 3. Returns created size profile
   *
   * @param {CreateSizeProfileDto} createSizeProfileDto - The size profile data containing:
   *   - userId (user ID)
   *   - height, weight, measurements
   *   - Size preferences (shirt, pants, shoes sizes)
   *   - Body measurements (chest, waist, hip, etc.)
   *
   * @returns {Promise<SizeProfiles>} The created size profile with details:
   *   - Size profile ID, user ID
   *   - All measurement data
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If size profile creation fails
   *
   * @remarks
   * - Users can have multiple size profiles for different clothing types
   * - Used for size recommendations and product filtering
   * - Helps improve product fit accuracy
   */
  async create(
    createSizeProfileDto: CreateSizeProfileDto,
  ): Promise<SizeProfiles> {
    try {
      const result = await this.prismaService.sizeProfiles.create({
        data: { ...createSizeProfileDto },
      });

      this.logger.log('Size profile created successfully', result.id);
      return result;
    } catch (error) {
      this.logger.log('Error creating size profile', error);
      throw new BadRequestException('Failed to create size profile');
    }
  }

  /**
   * Retrieves paginated list of all size profiles.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all size profiles from database
   * 3. Sorts results by profile ID ascending
   * 4. Returns paginated size profile data
   * 5. Logs successful retrieval
   *
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
   * - Returns empty array if no profiles exist
   * - Used for admin size profile management
   */
  async findAll(page: number, perPage: number): Promise<SizeProfiles[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        SizeProfiles,
        Prisma.SizeProfilesFindManyArgs
      >(
        this.prismaService.sizeProfiles,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log('Size profiles retrieved successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error retrieving size profiles', error);
      throw new BadRequestException('Failed to retrieve size profiles');
    }
  }

  /**
   * Retrieves a single size profile by ID.
   *
   * This method performs the following operations:
   * 1. Queries size profile by ID
   * 2. Validates profile exists
   * 3. Logs successful retrieval
   * 4. Returns size profile details
   *
   * @param {number} id - The size profile ID to retrieve
   *
   * @returns {Promise<SizeProfiles | null>} The size profile with details:
   *   - Size profile ID, user ID
   *   - Height, weight, measurements
   *   - Size preferences (shirt, pants, shoes)
   *   - Body measurements (chest, waist, hip, etc.)
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If size profile not found
   * @throws {BadRequestException} If size profile retrieval fails
   *
   * @remarks
   * - Returns null if profile doesn't exist
   * - Used for viewing specific size profile details
   * - Helps in size recommendation calculations
   */
  async findOne(id: number): Promise<SizeProfiles | null> {
    try {
      const result = await this.prismaService.sizeProfiles.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Size profile not found!');
      }

      this.logger.log('Size profile retrieved successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error retrieving size profile', error);
      throw new BadRequestException('Failed to retrieve size profile');
    }
  }

  /**
   * Updates an existing size profile.
   *
   * This method performs the following operations:
   * 1. Updates size profile in database
   * 2. Logs successful update
   * 3. Returns updated size profile
   *
   * @param {number} id - The size profile ID to update
   * @param {UpdateSizeProfileDto} updateSizeProfileDto - The update data containing:
   *   - height, weight, measurements (optional)
   *   - Size preferences (shirt, pants, shoes) (optional)
   *   - Body measurements updates (optional)
   *
   * @returns {Promise<SizeProfiles>} The updated size profile with all details
   *
   * @throws {BadRequestException} If size profile update fails
   * @throws {NotFoundException} If size profile not found
   *
   * @remarks
   * - Only provided fields are updated
   * - Updates timestamp automatically
   * - Used when user measurements change
   * - Helps maintain accurate size recommendations
   */
  async update(
    id: number,
    updateSizeProfileDto: UpdateSizeProfileDto,
  ): Promise<SizeProfiles> {
    try {
      const result = await this.prismaService.sizeProfiles.update({
        where: { id: id },
        data: { ...updateSizeProfileDto },
      });

      this.logger.log('Size profile updated successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error updating size profile', error);
      throw new BadRequestException('Failed to update size profile');
    }
  }

  /**
   * Deletes a size profile by ID.
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes size profile from database
   * 3. Returns deleted size profile
   *
   * @param {number} id - The size profile ID to delete
   *
   * @returns {Promise<SizeProfiles>} The deleted size profile with all details
   *
   * @throws {BadRequestException} If size profile deletion fails
   * @throws {NotFoundException} If size profile not found
   *
   * @remarks
   * - This operation is irreversible
   * - User can create new profile after deletion
   * - Does not affect user account or other data
   * - Used when profile is no longer needed
   */
  async remove(id: number): Promise<SizeProfiles> {
    try {
      this.logger.log('Size profile deleted: ', id);
      return await this.prismaService.sizeProfiles.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting size profile', error);
      throw new BadRequestException('Failed to delete size profile');
    }
  }
}
