import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/v1/customer-portal/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get()
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