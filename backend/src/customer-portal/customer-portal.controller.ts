import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';

@Controller('api/v1/customer-portal')
export class CustomerPortalController {
  constructor(
    private readonly customerPortalService: CustomerPortalService,
  ) {}

  @Get('access/me')
  async getCurrentCustomer(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.customerPortalService.getCurrentCustomer(userId);
  }

  @Get('dashboard')
  async getDashboard(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.customerPortalService.getDashboard(userId);
  }
}