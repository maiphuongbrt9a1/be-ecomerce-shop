import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { Public } from '@/decorator/customize';

@ApiTags('Recommendation')
@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @ApiOperation({
    summary: 'Get outfit recommendation for a product variant',
  })
  @ApiParam({
    name: 'productVariantId',
    required: true,
    type: Number,
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Outfit recommendation retrieved successfully',
  })
  @Public()
  @Get('outfit/:productVariantId')
  async getOutfitRecommendation(
    @Param('productVariantId', ParseIntPipe) productVariantId: number,
  ) {
    return await this.recommendationService.getOutfitRecommendation(
      productVariantId,
    );
  }
}
