import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Color, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ColorService {
  private readonly logger = new Logger(ColorService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new color option for product variants.
   *
   * This method performs the following operations:
   * 1. Creates color record in database
   * 2. Validates successful creation
   * 3. Logs successful creation
   * 4. Returns created color details
   *
   * @param {CreateColorDto} createColorDto - The color data containing:
   *   - colorName (e.g., "Red", "Blue", "Forest Green")
   *   - hexCode (e.g., "#FF0000", "#0000FF")
   *   - description (optional)
   *
   * @returns {Promise<Color>} The created color with:
   *   - Color ID, name, hex code
   *   - Description
   *   - Created timestamp
   *
   * @throws {NotFoundException} If color creation returns null
   * @throws {BadRequestException} If color creation fails
   *
   * @remarks
   * - Colors are reusable across product variants
   * - Hex code for UI color display
   * - Used in product variant configuration
   * - Enables color-based product filtering
   */
  async create(createColorDto: CreateColorDto): Promise<Color> {
    try {
      const result = await this.prismaService.color.create({
        data: { ...createColorDto },
      });

      if (!result) {
        throw new NotFoundException('Failed to create color');
      }

      this.logger.log(`Color created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create color: ', error);
      throw new BadRequestException('Failed to create color');
    }
  }

  /**
   * Retrieves paginated list of all color options.
   *
   * This method performs the following operations:
   * 1. Creates paginator with specified page size
   * 2. Queries all colors from database
   * 3. Sorts results by color ID ascending
   * 4. Returns paginated color data
   * 5. Logs successful retrieval
   *
   * @param {number} page - The page number (1-indexed)
   * @param {number} perPage - Number of colors per page
   *
   * @returns {Promise<Color[] | []>} Array of colors or empty array:
   *   - Color ID, name, hex code
   *   - Description
   *   - Created/updated timestamps
   *
   * @throws {BadRequestException} If color retrieval fails
   *
   * @remarks
   * - Results are paginated based on perPage parameter
   * - Results are sorted by color ID in ascending order
   * - Returns empty array if no colors exist
   * - Used for color selection in product variant forms
   * - Used for color filter options in product search
   */
  async findAll(page: number, perPage: number): Promise<Color[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Color, Prisma.ColorFindManyArgs>(
        this.prismaService.color,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all colors - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all colors: ', error);
      throw new BadRequestException('Failed to fetch all colors');
    }
  }

  /**
   * Retrieves a single color option by ID.
   *
   * This method performs the following operations:
   * 1. Queries color by ID
   * 2. Validates color exists
   * 3. Logs successful retrieval
   * 4. Returns color details
   *
   * @param {number} id - The color ID to retrieve
   *
   * @returns {Promise<Color | null>} The color with:
   *   - Color ID, name, hex code
   *   - Description
   *   - Created/updated timestamps
   *
   * @throws {NotFoundException} If color not found
   * @throws {BadRequestException} If color retrieval fails
   *
   * @remarks
   * - Returns null if color doesn't exist
   * - Used for displaying color details
   * - Used in product variant management
   */
  async findOne(id: number): Promise<Color | null> {
    try {
      const result = await this.prismaService.color.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Color not found!');
      }

      this.logger.log(`Fetched color with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch color with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch color');
    }
  }

  /**
   * Updates an existing color option.
   *
   * This method performs the following operations:
   * 1. Updates color in database
   * 2. Logs successful update
   * 3. Returns updated color
   *
   * @param {number} id - The color ID to update
   * @param {UpdateColorDto} updateColorDto - The update data containing:
   *   - colorName (optional)
   *   - hexCode (optional)
   *   - description (optional)
   *
   * @returns {Promise<Color>} The updated color with all details
   *
   * @throws {BadRequestException} If color update fails
   * @throws {NotFoundException} If color not found
   *
   * @remarks
   * - Updates affect all product variants using this color
   * - Hex code updates change display color across site
   * - Used for color catalog maintenance
   * - Should validate hex code format if changed
   */
  async update(id: number, updateColorDto: UpdateColorDto): Promise<Color> {
    try {
      const result = await this.prismaService.color.update({
        where: { id: id },
        data: { ...updateColorDto },
      });

      this.logger.log(`Updated color with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update color with ID ${id}: `, error);
      throw new BadRequestException('Failed to update color');
    }
  }

  /**
   * Deletes a color option by ID.
   *
   * This method performs the following operations:
   * 1. Logs deletion operation
   * 2. Deletes color from database
   * 3. Returns deleted color
   *
   * @param {number} id - The color ID to delete
   *
   * @returns {Promise<Color>} The deleted color with all details
   *
   * @throws {BadRequestException} If color deletion fails
   * @throws {NotFoundException} If color not found
   *
   * @remarks
   * - This operation is irreversible
   * - Should not delete if color is used by active product variants
   * - Database cascades handle related record cleanup
   * - Used for color catalog cleanup
   */
  async remove(id: number): Promise<Color> {
    try {
      this.logger.log(`Removing color with ID: ${id}`);
      return await this.prismaService.color.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove color with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove color');
    }
  }
}
