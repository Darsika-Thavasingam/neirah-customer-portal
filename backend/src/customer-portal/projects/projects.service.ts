import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCustomerId(userId: string): Promise<string> {
    const access = await this.prisma.customerPortalAccess.findUnique({
      where: {
        userId,
      },
      select: {
        customerId: true,
        isActive: true,
      },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Customer portal access is not active',
      );
    }

    return access.customerId;
  }

  async getProjects(userId: string) {
    const customerId = await this.getCustomerId(userId);

    return this.prisma.project.findMany({
      where: {
        customerId,
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
      },
    });
  }

  async getProject(userId: string, projectId: string) {
    const customerId = await this.getCustomerId(userId);

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        customerId,
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
          select: {
            id: true,
            title: true,
            update: true,
            postedBy: true,
            attachment: true,
            createdAt: true,
          },
        },

        photos: {
          orderBy: {
            uploadedAt: 'desc',
          },
          select: {
            id: true,
            photoUrl: true,
            caption: true,
            uploadedAt: true,
          },
        },

        documents: {
          orderBy: {
            uploadedAt: 'desc',
          },
          select: {
            id: true,
            fileName: true,
            category: true,
            fileUrl: true,
            uploadedAt: true,
          },
        },

        quotations: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            quotationNumber: true,
            date: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },

        contracts: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            contractNumber: true,
            contractDate: true,
            status: true,
            documentUrl: true,
            createdAt: true,
          },
        },

        invoices: {
          orderBy: {
            invoiceDate: 'desc',
          },
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            invoiceDate: true,
            dueDate: true,
            paidAmount: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}