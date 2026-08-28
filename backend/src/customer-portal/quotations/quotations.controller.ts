import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';

@ApiTags('Customer Portal - Quotations')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal/quotations')
export class QuotationsController {
  constructor(
    private readonly quotationsService: QuotationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List commercial quotations and proposals' })
  @ApiResponse({ status: 200, description: 'Quotations retrieved successfully' })
  async getQuotations(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.quotationsService.getQuotations(userId);
  }

  @Get(':quotationId')
  @ApiOperation({ summary: 'Get detailed proposal for a single quotation' })
  @ApiParam({ name: 'quotationId', description: 'Unique quotation identifier' })
  @ApiResponse({ status: 200, description: 'Quotation details retrieved successfully' })
  async getQuotation(
    @Headers('x-user-id') userId: string | undefined,
    @Param('quotationId') quotationId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.quotationsService.getQuotation(
      userId,
      quotationId,
    );
  }
}