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
  async getDashboard(userId: string) {
  const access = await this.prisma.customerPortalAccess.findUnique({
    where: {
      userId,
    },
    select: {
      customerId: true,
      isActive: true,
      customer: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
        },
      },
    },
  });

  if (!access || !access.isActive) {
    throw new UnauthorizedException(
      'Customer portal access is not active',
    );
  }

  const projects = await this.prisma.project.findMany({
    where: {
      customerId: access.customerId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      projectCode: true,
      name: true,
      location: true,
      startDate: true,
      expectedCompletionDate: true,
      status: true,
      progress: true,
      currentPhase: true,
      projectManagerName: true,
      projectManagerContact: true,
      recentUpdate: true,
      updatedAt: true,

      milestones: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          name: true,
          description: true,
          plannedDate: true,
          actualCompletionDate: true,
          status: true,
          progress: true,
        },
      },

      updates: {
        where: {
          visibility: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          title: true,
          update: true,
          postedBy: true,
          attachment: true,
          createdAt: true,
        },
      },
    },
  });

  const notifications =
    await this.prisma.customerNotification.findMany({
      where: {
        customerId: access.customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    });

  return {
    customer: access.customer,
    summary: {
      totalProjects: projects.length,
      activeProjects: projects.filter(
        (project) =>
          project.status.toUpperCase() === 'IN_PROGRESS',
      ).length,
      unreadNotifications: notifications.filter(
        (notification) => !notification.isRead,
      ).length,
    },
    projects,
    notifications,
  };
}
}