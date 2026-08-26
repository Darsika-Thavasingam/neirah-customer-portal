import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/v1/customer-portal/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async getNotifications(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is required');
    }
    return this.notificationsService.getNotifications(userId);
  }
}
