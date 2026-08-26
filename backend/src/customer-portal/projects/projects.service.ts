import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPortalContext(
    userId: string,
  ): Promise<{ customerId: string; tenantId: string }> {
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
      select: {
        customerId: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
    }

    return { customerId: access.customerId, tenantId: access.tenantId };
  }

  async getProjects(userId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    return this.prisma.project.findMany({
      where: { customerId, tenantId },
      orderBy: { updatedAt: 'desc' },
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
          orderBy: { createdAt: 'asc' },
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
          where: { visibility: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            title: true,
            update: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getProject(userId: string, projectId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, customerId, tenantId },
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

        customer: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          },
        },

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
          where: {
            isCustomerVisible: true,
          },
          orderBy: {
            uploadedAt: 'desc',
          },
          select: {
            id: true,
            photoUrl: true,
            caption: true,
            category: true,
            uploadedAt: true,
          },
        },

        documents: {
          where: {
            isCustomerVisible: true,
          },
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

  async getProjectUpdates(userId: string, projectId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, customerId, tenantId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectUpdate.findMany({
      where: { projectId: project.id, visibility: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        update: true,
        postedBy: true,
        attachment: true,
        createdAt: true,
      },
    });
  }

  async getProjectMilestones(userId: string, projectId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, customerId, tenantId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.milestone.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        plannedDate: true,
        actualCompletionDate: true,
        status: true,
        progress: true,
      },
    });
  }

  async getProjectPhotos(userId: string, projectId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, customerId, tenantId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectPhoto.findMany({
      where: { projectId: project.id, isCustomerVisible: true },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        photoUrl: true,
        caption: true,
        category: true,
        uploadedAt: true,
      },
    });
  }

  async getProjectDocuments(userId: string, projectId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, customerId, tenantId },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.customerVisibleDocument.findMany({
      where: {
        projectId: project.id,
        tenantId: project.tenantId,
        isCustomerVisible: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      select: {
        id: true,
        category: true,
        fileName: true,
        fileUrl: true,
        uploadedAt: true,
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
    });
  }
}