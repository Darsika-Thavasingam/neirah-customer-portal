import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';

@Controller('api/v1/customer-portal/quotations')
export class QuotationsController {
  constructor(
    private readonly quotationsService: QuotationsService,
  ) {}

  @Get()
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