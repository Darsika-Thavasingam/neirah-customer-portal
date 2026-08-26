import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCustomerId(userId: string): Promise<string> {
    const cleanId = userId?.trim();
    if (!cleanId) {
      throw new UnauthorizedException('Customer portal access key is required');
    }

    const access = await this.prisma.customerPortalAccess.findFirst({
      where: {
        OR: [
          { userId: cleanId },
          { id: cleanId },
          { customerId: cleanId },
        ],
      },
      select: { customerId: true, isActive: true },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
    }

    return access.customerId;
  }

  async getNotifications(userId: string) {
    const customerId = await this.getCustomerId(userId);

    return this.prisma.customerNotification.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    });
  }
}
