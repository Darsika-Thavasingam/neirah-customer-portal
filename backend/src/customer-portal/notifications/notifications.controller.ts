import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Customer Portal - Notifications')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List customer system notifications and activity alerts' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is required');
    }
    return this.notificationsService.getNotifications(userId);
  }
}
