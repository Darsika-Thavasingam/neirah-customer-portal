import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentCustomer(userId: string) {
    const access = await this.prisma.customerPortalAccess.findUnique({
      where: {
        userId,
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
            billingInfo: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Customer portal access is not active',
      );
    }

    if (!access.customer || !access.user) {
      throw new NotFoundException('Customer portal profile not found');
    }

    return {
      customer: access.customer,
      user: access.user,
      portalAccess: {
        id: access.id,
        isActive: access.isActive,
        lastLogin: access.lastLogin,
      },
    };
  }
}