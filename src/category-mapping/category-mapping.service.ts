import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCategoryMappingDto } from './dto/create-category-mapping.dto';
import { UpdateCategoryMappingDto } from './dto/update-category-mapping.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CategoryMapping, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CategoryMappingService {
  private readonly logger = new Logger(CategoryMappingService.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create a new category mapping
   * @param {CreateCategoryMappingDto} createCategoryMappingDto - DTO containing mapping data (baseCategoryId, suggestCategoryId)
   * @returns {Promise<CategoryMapping>} The created category mapping object
   * @throws {BadRequestException} When category mapping creation fails
   */
  async create(
    createCategoryMappingDto: CreateCategoryMappingDto,
  ): Promise<CategoryMapping> {
    try {
      const result = await this.prismaService.categoryMapping.create({
        data: {
          ...createCategoryMappingDto,
        },
      });
      this.logger.log(`Created category mapping with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create category mapping', error);
      throw new BadRequestException('Failed to create category mapping');
    }
  }

  /**
   * Retrieve all category mappings with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Number of items per page (default: 10)
   * @returns {Promise<CategoryMapping[] | []>} Array of category mappings for the requested page
   * @throws {BadRequestException} When fetching category mappings fails
   */
  async findAll(
    page: number = 1,
    perPage: number = 10,
  ): Promise<CategoryMapping[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        CategoryMapping,
        Prisma.CategoryMappingFindManyArgs
      >(
        this.prismaService.categoryMapping,
        {
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log(
        `Fetched all category mappings - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all category mappings: ', error);
      throw new BadRequestException('Failed to fetch all category mappings');
    }
  }

  /**
   * Retrieve a specific category mapping by ID
   * @param {number} id - The category mapping ID
   * @returns {Promise<CategoryMapping[] | []>} Array containing the category mapping (or empty array if not found)
   * @throws {BadRequestException} When finding category mapping fails
   */
  async findOne(id: number): Promise<CategoryMapping[] | []> {
    try {
      const result = await this.prismaService.categoryMapping.findMany({
        where: { id },
      });

      this.logger.log(`Fetched category mapping for ID: ${id}`);

      return result;
    } catch (error) {
      this.logger.error('Failed to find category mapping', error);
      throw new BadRequestException('Failed to find category mapping');
    }
  }

  /**
   * Update an existing category mapping
   * @param {number} id - The category mapping ID to update
   * @param {UpdateCategoryMappingDto} updateCategoryMappingDto - DTO containing updated mapping data
   * @returns {Promise<CategoryMapping>} The updated category mapping object
   * @throws {BadRequestException} When category mapping update fails
   */
  async update(id: number, updateCategoryMappingDto: UpdateCategoryMappingDto) {
    try {
      const result = await this.prismaService.categoryMapping.update({
        where: { id },
        data: {
          ...updateCategoryMappingDto,
        },
      });
      this.logger.log(`Updated category mapping with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to update category mapping', error);
      throw new BadRequestException('Failed to update category mapping');
    }
  }

  /**
   * Delete a category mapping by ID
   * @param {number} id - The category mapping ID to delete
   * @returns {Promise<CategoryMapping>} The deleted category mapping object
   * @throws {BadRequestException} When category mapping deletion fails
   */
  async remove(id: number) {
    try {
      const result = await this.prismaService.categoryMapping.delete({
        where: { id },
      });
      this.logger.log(`Removed category mapping with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to remove category mapping', error);
      throw new BadRequestException('Failed to remove category mapping');
    }
  }
}
