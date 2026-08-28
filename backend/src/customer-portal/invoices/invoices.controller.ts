import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';

@ApiTags('Customer Portal - Invoices')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal/invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all customer invoices and billing valuations' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
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
  @ApiOperation({ summary: 'Get list of pending or unpaid invoices' })
  @ApiResponse({ status: 200, description: 'Outstanding invoices retrieved successfully' })
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
  @ApiOperation({ summary: 'Get detailed statement for a single invoice' })
  @ApiParam({ name: 'invoiceId', description: 'Unique invoice identifier' })
  @ApiResponse({ status: 200, description: 'Invoice details retrieved successfully' })
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