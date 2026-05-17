import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCategoryMappingDto } from './dto/create-category-mapping.dto';
import { UpdateCategoryMappingDto } from './dto/update-category-mapping.dto';
import { SyncCategoryMappingDto } from './dto/sync-category-mapping.dto';
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
   * Retrieve all category mappings with pagination, optionally scoped by baseCategoryId
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Number of items per page (default: 10)
   * @param {number | undefined} baseCategoryId - Optional baseCategoryId to scope results to one base category
   * @returns {Promise<CategoryMapping[] | []>} Array of category mappings for the requested page
   * @throws {BadRequestException} When fetching category mappings fails
   */
  async findAll(
    page: number = 1,
    perPage: number = 10,
    baseCategoryId?: number,
  ): Promise<CategoryMapping[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const where: Prisma.CategoryMappingWhereInput = baseCategoryId
        ? { baseCategoryId: BigInt(baseCategoryId) }
        : {};
      const result = await paginate<
        CategoryMapping,
        Prisma.CategoryMappingFindManyArgs
      >(
        this.prismaService.categoryMapping,
        {
          where,
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      this.logger.log(
        `Fetched all category mappings - Page: ${page}, Per Page: ${perPage}, Base: ${baseCategoryId ?? 'all'}`,
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

  /**
   * Replace all outgoing mappings for one base category in a single transaction.
   * When `symmetric` is true, also keeps each reverse mapping (suggest -> base)
   * in sync so the storefront can recommend mixes from either side.
   * @param {SyncCategoryMappingDto} dto - sync payload
   * @returns {Promise<CategoryMapping[]>} The full outgoing list after the sync
   * @throws {BadRequestException} When sync fails or self-mix is requested
   */
  async sync(dto: SyncCategoryMappingDto): Promise<CategoryMapping[]> {
    const baseId = BigInt(dto.baseCategoryId);
    const suggestIds = (dto.suggestCategoryIds ?? []).map((n) => BigInt(n));
    const symmetric = dto.symmetric ?? false;

    if (suggestIds.some((id) => id === baseId)) {
      throw new BadRequestException(
        'A category cannot be mapped to mix with itself',
      );
    }

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        // Outgoing: base -> *
        const existingOutgoing = await tx.categoryMapping.findMany({
          where: { baseCategoryId: baseId },
        });
        const desiredOutgoing = new Set(suggestIds.map((id) => id.toString()));
        const outgoingToDelete = existingOutgoing
          .filter((m) => !desiredOutgoing.has(m.suggestCategoryId.toString()))
          .map((m) => m.id);
        const existingOutgoingSet = new Set(
          existingOutgoing.map((m) => m.suggestCategoryId.toString()),
        );
        const outgoingToCreate = suggestIds.filter(
          (id) => !existingOutgoingSet.has(id.toString()),
        );

        if (outgoingToDelete.length > 0) {
          await tx.categoryMapping.deleteMany({
            where: { id: { in: outgoingToDelete } },
          });
        }
        if (outgoingToCreate.length > 0) {
          await tx.categoryMapping.createMany({
            data: outgoingToCreate.map((suggestCategoryId) => ({
              baseCategoryId: baseId,
              suggestCategoryId,
            })),
            skipDuplicates: true,
          });
        }

        if (symmetric) {
          // Incoming: * -> base. After sync, the only "* -> base" rows that
          // should exist are those where * is one of the new suggestIds.
          const existingIncoming = await tx.categoryMapping.findMany({
            where: { suggestCategoryId: baseId },
          });
          const desiredIncoming = new Set(suggestIds.map((id) => id.toString()));
          const incomingToDelete = existingIncoming
            .filter((m) => !desiredIncoming.has(m.baseCategoryId.toString()))
            .map((m) => m.id);
          const existingIncomingSet = new Set(
            existingIncoming.map((m) => m.baseCategoryId.toString()),
          );
          const incomingToCreate = suggestIds.filter(
            (id) => !existingIncomingSet.has(id.toString()),
          );

          if (incomingToDelete.length > 0) {
            await tx.categoryMapping.deleteMany({
              where: { id: { in: incomingToDelete } },
            });
          }
          if (incomingToCreate.length > 0) {
            await tx.categoryMapping.createMany({
              data: incomingToCreate.map((otherBaseId) => ({
                baseCategoryId: otherBaseId,
                suggestCategoryId: baseId,
              })),
              skipDuplicates: true,
            });
          }
        }

        return tx.categoryMapping.findMany({
          where: { baseCategoryId: baseId },
          orderBy: { id: 'asc' },
        });
      });

      this.logger.log(
        `Synced category mapping for base ${dto.baseCategoryId} -> [${dto.suggestCategoryIds.join(',')}] symmetric=${symmetric}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to sync category mapping', error);
      throw new BadRequestException('Failed to sync category mapping');
    }
  }

  /**
   * Count outgoing mappings grouped by base category. Used by the admin
   * Categories page to render the "N gợi ý mix" chip without N round-trips.
   * @returns {Promise<{ baseCategoryId: string; count: number }[]>}
   *   baseCategoryId is serialized as a string because Category.id is BigInt.
   * @throws {BadRequestException} When the aggregate query fails
   */
  async getCounts(): Promise<{ baseCategoryId: string; count: number }[]> {
    try {
      const groups = await this.prismaService.categoryMapping.groupBy({
        by: ['baseCategoryId'],
        _count: { _all: true },
      });
      return groups.map((g) => ({
        baseCategoryId: g.baseCategoryId.toString(),
        count: g._count._all,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch category mapping counts', error);
      throw new BadRequestException('Failed to fetch category mapping counts');
    }
  }
}
