import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Category, Prisma, Products } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new product category.
   *
   * This method performs the following operations:
   * 1. Creates a new category in the database
   * 2. Validates successful creation
   * 3. Logs the creation operation
   *
   * @param {CreateCategoryDto} createCategoryDto - The data transfer object containing category information:
   *   - Category name, description, parent category (if applicable)
   *
   * @returns {Promise<Category>} The created category with all details
   *
   * @throws {NotFoundException} If category creation fails
   * @throws {BadRequestException} If database operation fails
   *
   * @remarks
   * - Categories can be nested (parent-child hierarchy)
   * - Validates successful creation before returning data
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const result = await this.prismaService.category.create({
        data: { ...createCategoryDto },
      });
      if (!result) {
        throw new NotFoundException('Failed to create category');
      }

      this.logger.log(`Category created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create category: ', error);
      throw new BadRequestException('Failed to create category');
    }
  }

  /**
   * Retrieves a paginated list of all product categories.
   *
   * This method performs the following operations:
   * 1. Fetches categories from the database with pagination
   * 2. Orders results by category ID
   * 3. Logs pagination details
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of categories to retrieve per page
   *
   * @returns {Promise<Category[] | []>} Array of categories with details
   *   Returns empty array if no categories found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by category ID in ascending order
   * - Empty array returned for consistency
   */
  async findAll(page: number, perPage: number): Promise<Category[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Category, Prisma.CategoryFindManyArgs>(
        this.prismaService.category,
        { orderBy: { id: 'asc' } },
        { page: page },
      );

      this.logger.log(
        `Fetched all categories - Page: ${page}, Per Page: ${perPage}`,
      );
      return result.data;
    } catch (error) {
      this.logger.error('Failed to fetch all categories: ', error);
      throw new BadRequestException('Failed to fetch all categories');
    }
  }

  /**
   * Retrieves a single category by ID.
   *
   * This method performs the following operations:
   * 1. Queries the database for the category by ID
   * 2. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the category to retrieve
   *
   * @returns {Promise<Category | null>} The category with all details
   *   Returns null if category not found
   *
   * @throws {NotFoundException} If category is not found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Useful for fetching category details for display or editing
   */
  async findOne(id: number): Promise<Category | null> {
    try {
      const result = await this.prismaService.category.findFirst({
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Category not found!');
      }

      this.logger.log(`Fetched category with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch category with ID ${id}: `, error);
      throw new BadRequestException('Failed to fetch category');
    }
  }

  /**
   * Updates an existing category with new information.
   *
   * This method performs the following operations:
   * 1. Updates the category in the database
   * 2. Logs the update operation
   *
   * @param {number} id - The unique identifier of the category to update
   * @param {UpdateCategoryDto} updateCategoryDto - The data transfer object containing category updates:
   *   - May include name, description, parent category, or other properties
   *
   * @returns {Promise<Category>} The updated category with new values
   *
   * @throws {BadRequestException} If category update fails
   *
   * @remarks
   * - Supports updating category hierarchy (parent-child relationships)
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const result = await this.prismaService.category.update({
        where: { id: id },
        data: { ...updateCategoryDto },
      });

      this.logger.log(`Updated category with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update category with ID ${id}: `, error);
      throw new BadRequestException('Failed to update category');
    }
  }

  /**
   * Deletes a category from the database.
   *
   * This method performs the following operations:
   * 1. Removes the category from the database
   * 2. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the category to delete
   *
   * @returns {Promise<Category>} The deleted category record
   *
   * @throws {BadRequestException} If deletion fails or category not found
   *
   * @remarks
   * - Verify before deletion as this action cannot be easily reversed
   * - Check for child categories and products before deletion
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Category> {
    try {
      this.logger.log(`Removing category with ID: ${id}`);
      return await this.prismaService.category.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove category with ID ${id}: `, error);
      throw new BadRequestException('Failed to remove category');
    }
  }

  /**
   * Retrieves all sub-categories that belong to a parent category.
   *
   * This method performs the following operations:
   * 1. Queries the database for categories with matching parent ID
   * 2. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the parent category
   *
   * @returns {Promise<Category[] | []>} Array of sub-categories
   *   Returns empty array if no sub-categories found
   *
   * @throws {NotFoundException} If no sub-categories found
   * @throws {BadRequestException} If data fetching fails
   *
   * @remarks
   * - Supports multi-level category hierarchy
   * - Empty array returned for consistency
   */
  async getAllSubCategoriesOfCategory(id: number): Promise<Category[] | []> {
    try {
      const result = await this.prismaService.category.findMany({
        where: { parentId: id },
      });

      if (!result) {
        throw new NotFoundException('Sub-category not found!');
      }

      this.logger.log(`Fetched sub-categories for category ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch sub-categories for category ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch sub-categories');
    }
  }

  /**
   * Retrieves paginated products that belong to a specific category.
   *
   * This method performs the following operations:
   * 1. Fetches products from the database filtered by category ID
   * 2. Supports pagination for large product lists
   * 3. Orders results by product ID
   * 4. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the category
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of products to retrieve per page
   *
   * @returns {Promise<Products[] | []>} Array of products in the category
   *   Returns empty array if no products found
   *
   * @throws {NotFoundException} If no products found
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by product ID in ascending order
   * - Useful for category detail pages
   * - Empty array returned for consistency
   */
  async getAllProductsOfCategory(
    id: number,
    page: number,
    perPage: number,
  ): Promise<Products[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<Products, Prisma.ProductsFindManyArgs>(
        this.prismaService.products,
        { where: { categoryId: id }, orderBy: { id: 'asc' } },
        { page: page },
      );

      if (!result) {
        throw new NotFoundException('Products not found!');
      }

      this.logger.log(`Fetched products for category ID: ${id}`);
      return result.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products for category ID ${id}: `,
        error,
      );
      throw new BadRequestException('Failed to fetch products');
    }
  }
}
