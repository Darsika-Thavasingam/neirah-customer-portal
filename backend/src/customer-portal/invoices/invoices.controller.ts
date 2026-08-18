import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('api/v1/customer-portal/invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get()
  async getInvoices(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.invoicesService.getInvoices(userId);
  }

  @Get('outstanding')
  async getOutstandingInvoices(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.invoicesService.getOutstandingInvoices(
      userId,
    );
  }

  @Get(':invoiceId')
  async getInvoice(
    @Headers('x-user-id') userId: string | undefined,
    @Param('invoiceId') invoiceId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.invoicesService.getInvoice(
      userId,
      invoiceId,
    );
  }
}