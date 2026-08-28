import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Customer Portal - Payments')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all payment transactions and receipts' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.paymentsService.getPayments(userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get total remitted funds and payment metrics' })
  @ApiResponse({ status: 200, description: 'Payment summary metrics retrieved successfully' })
  async getPaymentSummary(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.paymentsService.getPaymentSummary(userId);
  }
}