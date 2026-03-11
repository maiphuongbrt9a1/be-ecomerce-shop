import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Shipments } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { AwsS3Service } from '@/aws-s3/aws-s3.service';
import {
  OrdersWithFullInformationInclude,
  ShipmentsWithFullInformation,
} from '@/helpers/types/types';
import { formatMediaFieldWithLoggingForShipments } from '@/helpers/utils';
@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsS3Service,
  ) {}

  /**
   * Creates a new shipment record for an order.
   *
   * This method performs the following operations:
   * 1. Creates a new shipment in the database
   * 2. Retrieves the created shipment with all related information
   * 3. Includes staff who processed the shipment and order details
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs the creation operation
   *
   * @param {CreateShipmentDto} createShipmentDto - The data transfer object containing shipment information:
   *   - orderId: The ID of the order to ship
   *   - carrier: Shipping carrier name (DHL, FedEx, etc.)
   *   - trackingNumber: Unique tracking identifier
   *   - estimatedDelivery: Expected delivery date
   *
   * @returns {Promise<ShipmentsWithFullInformation>} The created shipment with all details including:
   *   - Shipment information (id, status, dates, carrier, tracking)
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *
   * @throws {BadRequestException} If shipment creation or retrieval fails
   *
   * @remarks
   * - Includes all related staff and order information
   * - Media URLs are converted to public HTTPS URLs
   */
  async create(
    createShipmentDto: CreateShipmentDto,
  ): Promise<ShipmentsWithFullInformation> {
    try {
      const result = await this.prismaService.shipments.create({
        data: { ...createShipmentDto },
      });

      if (!result) {
        throw new BadRequestException('Shipment creation failed');
      }

      let returnResult = await this.prismaService.shipments.findUnique({
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new BadRequestException(
          'Shipment retrieval failed after creation',
        );
      }

      // generate public url for media fields in shipment
      returnResult = formatMediaFieldWithLoggingForShipments(
        [returnResult],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Shipment created successfully', result.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error creating shipment', error);
      throw new BadRequestException('Failed to create shipment');
    }
  }

  /**
   * Retrieves a paginated list of all shipments with complete information.
   *
   * This method performs the following operations:
   * 1. Fetches shipments from the database with pagination
   * 2. Includes staff information who processed each shipment
   * 3. Includes complete order information for each shipment
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Orders results by shipment ID
   *
   * @param {number} page - The page number for pagination (1-indexed)
   * @param {number} perPage - The number of shipments to retrieve per page
   *
   * @returns {Promise<ShipmentsWithFullInformation[] | []>} Array of shipments with all details including:
   *   - Shipment information (id, status, dates, carrier, tracking)
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *   Returns empty array if no shipments found
   *
   * @throws {BadRequestException} If pagination or data fetching fails
   *
   * @remarks
   * - Results are ordered by shipment ID in ascending order
   * - Media URLs are converted to public HTTPS URLs
   * - Includes comprehensive tracking and staff information
   */
  async findAll(
    page: number,
    perPage: number,
  ): Promise<ShipmentsWithFullInformation[] | []> {
    try {
      const paginate = createPaginator({ perPage: perPage });
      const result = await paginate<
        ShipmentsWithFullInformation,
        Prisma.ShipmentsFindManyArgs
      >(
        this.prismaService.shipments,
        {
          include: {
            processByStaff: {
              include: {
                userMedia: true,
              },
            },
            order: {
              include: OrdersWithFullInformationInclude,
            },
          },
          orderBy: { id: 'asc' },
        },
        { page: page },
      );

      // generate public url for media fields in shipments
      result.data = formatMediaFieldWithLoggingForShipments(
        result.data,
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      );

      this.logger.log('Fetched shipments successfully');
      return result.data;
    } catch (error) {
      this.logger.log('Error fetching shipments', error);
      throw new BadRequestException('Failed to fetch shipments');
    }
  }

  /**
   * Retrieves a single shipment by ID with complete information.
   *
   * This method performs the following operations:
   * 1. Queries the database for the shipment by ID
   * 2. Includes staff information who processed the shipment
   * 3. Includes complete order information
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs retrieval operation
   *
   * @param {number} id - The unique identifier of the shipment to retrieve
   *
   * @returns {Promise<ShipmentsWithFullInformation | null>} The shipment with all details including:
   *   - Shipment information (id, status, dates, carrier, tracking)
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *   Returns null if shipment not found
   *
   * @throws {NotFoundException} If shipment is not found
   * @throws {BadRequestException} If data fetching or formatting fails
   *
   * @remarks
   * - Media URLs are converted to public HTTPS URLs
   * - Includes staff profile for accountability tracking
   */
  async findOne(id: number): Promise<ShipmentsWithFullInformation | null> {
    try {
      let result = await this.prismaService.shipments.findFirst({
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Shipments not found!');
      }

      // generate public url for media fields in shipment
      result = formatMediaFieldWithLoggingForShipments(
        [result],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Fetched shipment successfully', id);
      return result;
    } catch (error) {
      this.logger.log('Error fetching shipment', error);
      throw new BadRequestException('Failed to fetch shipment');
    }
  }

  /**
   * Updates an existing shipment with new information.
   *
   * This method performs the following operations:
   * 1. Updates the shipment in the database
   * 2. Retrieves the updated shipment with all related information
   * 3. Includes staff and order details
   * 4. Formats all media URLs to public HTTPS URLs
   * 5. Logs the update operation
   *
   * @param {number} id - The unique identifier of the shipment to update
   * @param {UpdateShipmentDto} updateShipmentDto - The data transfer object containing shipment updates:
   *   - May include status, tracking number, estimated dates, or other properties
   *
   * @returns {Promise<ShipmentsWithFullInformation>} The updated shipment with all details including:
   *   - Updated shipment information
   *   - Processing staff information with avatar media
   *   - Complete order details
   *   - Formatted media URLs
   *
   * @throws {BadRequestException} If shipment update or retrieval fails
   *
   * @remarks
   * - Validates successful update before returning data
   * - Includes all shipment context information
   * - Media URLs are converted to public HTTPS URLs
   */
  async update(
    id: number,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<ShipmentsWithFullInformation> {
    try {
      const result = await this.prismaService.shipments.update({
        where: { id: id },
        data: { ...updateShipmentDto },
      });

      if (!result) {
        throw new BadRequestException('Shipment update failed');
      }

      let returnResult = await this.prismaService.shipments.findUnique({
        include: {
          processByStaff: {
            include: {
              userMedia: true,
            },
          },
          order: {
            include: OrdersWithFullInformationInclude,
          },
        },
        where: { id: result.id },
      });

      if (!returnResult) {
        throw new BadRequestException('Shipment retrieval failed after update');
      }
      // generate public url for media fields in shipment
      returnResult = formatMediaFieldWithLoggingForShipments(
        [returnResult],
        (url: string) => this.awsService.buildPublicMediaUrl(url),
        this.logger,
      )[0];

      this.logger.log('Shipment updated successfully', returnResult.id);
      return returnResult;
    } catch (error) {
      this.logger.log('Error updating shipment', error);
      throw new BadRequestException('Failed to update shipment');
    }
  }

  /**
   * Deletes a shipment record from the database.
   *
   * This method performs the following operations:
   * 1. Removes the shipment record from the database
   * 2. Logs the deletion operation
   *
   * @param {number} id - The unique identifier of the shipment to delete
   *
   * @returns {Promise<Shipments>} The deleted shipment record
   *
   * @throws {BadRequestException} If deletion fails or shipment not found
   *
   * @remarks
   * - Verify before deletion as this action cannot be easily reversed
   * - Consider archiving instead of deleting for order history
   * - Use with caution in production environments
   */
  async remove(id: number): Promise<Shipments> {
    try {
      this.logger.log('Deleting shipment', id);
      return await this.prismaService.shipments.delete({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log('Error deleting shipment', error);
      throw new BadRequestException('Failed to delete shipment');
    }
  }
}
