import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CustomerPortalService } from './customer-portal.service';

@ApiTags('Customer Portal - Dashboard & User Access')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal')
export class CustomerPortalController {
  constructor(
    private readonly customerPortalService: CustomerPortalService,
  ) {}

  @Get('access/me')
  @ApiOperation({ summary: 'Fetch profile metadata of the current authenticated user' })
  @ApiResponse({ status: 200, description: 'Customer profile metadata returned' })
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
  @ApiOperation({ summary: 'Fetch executive dashboard summary, metrics, and active project counts' })
  @ApiResponse({ status: 200, description: 'Dashboard stats and financial summary fetched successfully' })
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