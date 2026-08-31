import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class CustomerPortalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves the portal context (customerId + tenantId) for a given userId.
   * Throws 401 if no active access record exists or if the format is invalid.
   */
  private async resolvePortalContext(userId: string): Promise<{
    customerId: string;
    tenantId: string;
    accessId: string;
  }> {
    const cleanId = userId?.trim();
    if (!cleanId || !UUID_REGEX.test(cleanId)) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
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
        id: true,
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

    // Update lastLogin (non-blocking)
    this.prisma.customerPortalAccess
      .update({
        where: { id: access.id },
        data: { lastLogin: new Date() },
      })
      .catch(() => {});

    return {
      customerId: access.customerId,
      tenantId: access.tenantId,
      accessId: access.id,
    };
  }

  /**
   * GET /access/me — Returns current customer profile & access record.
   */
  async getCurrentCustomer(userId: string) {
    const cleanId = userId?.trim();
    if (!cleanId || !UUID_REGEX.test(cleanId)) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
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
        id: true,
        tenantId: true,
        customerId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
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
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
    }

    if (!access.customer || !access.user) {
      throw new NotFoundException('Customer portal profile not found');
    }

    // Update lastLogin non-blocking
    this.prisma.customerPortalAccess
      .update({
        where: { id: access.id },
        data: { lastLogin: new Date() },
      })
      .catch(() => {});

    return {
      customer: access.customer,
      user: access.user,
      portalAccess: {
        id: access.id,
        isActive: access.isActive,
        lastLogin: access.lastLogin,
        memberSince: access.createdAt,
      },
    };
  }

  /**
   * GET /dashboard — Full customer dashboard data.
   */
  async getDashboard(userId: string) {
    const { customerId, tenantId } =
      await this.resolvePortalContext(userId);

    // 1. Customer info
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer record not found');
    }

    // 2. Projects
    const projects = await this.prisma.project.findMany({
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
          take: 3,
          select: {
            id: true,
            title: true,
            update: true,
            postedBy: true,
            createdAt: true,
          },
        },
      },
    });

    // 3. Pending quotations
    const pendingQuotations = await this.prisma.quotation.findMany({
      where: {
        customerId,
        tenantId,
        status: { in: ['SENT', 'DRAFT', 'PENDING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        quotationNumber: true,
        date: true,
        validUntil: true,
        total: true,
        status: true,
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    // 4. Outstanding invoices
    const outstandingInvoices = await this.prisma.invoice.findMany({
      where: {
        customerId,
        tenantId,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        total: true,
        paidAmount: true,
        status: true,
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    // 5. Recent payments
    const recentPayments = await this.prisma.payment.findMany({
      where: { customerId, tenantId },
      orderBy: { paymentDate: 'desc' },
      take: 5,
      select: {
        id: true,
        paymentReference: true,
        paymentDate: true,
        paymentMethod: true,
        amount: true,
        status: true,
        invoice: {
          select: { invoiceNumber: true },
        },
      },
    });

    // 6. Latest documents
    const latestDocuments = await this.prisma.customerVisibleDocument.findMany({
      where: { tenantId, isCustomerVisible: true, project: { customerId } },
      orderBy: { uploadedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fileName: true,
        category: true,
        fileUrl: true,
        uploadedAt: true,
        project: { select: { id: true, name: true, projectCode: true } },
      },
    });

    // 7. Notifications
    const notifications = await this.prisma.customerNotification.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
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

    // 8. Computed summary
    const activeProjects = projects.filter((p) =>
      ['IN_PROGRESS', 'ACTIVE', 'ON_HOLD', 'HANDOVER'].includes(
        p.status.toUpperCase(),
      ),
    );
    const completedProjects = projects.filter(
      (p) => p.status.toUpperCase() === 'COMPLETED',
    );
    const avgProgress =
      projects.length > 0
        ? Math.round(
            projects.reduce((s, p) => s + p.progress, 0) / projects.length,
          )
        : 0;

    const totalOutstanding = outstandingInvoices.reduce((s, inv) => {
      const bal = Math.max(Number(inv.total) - Number(inv.paidAmount), 0);
      return s + bal;
    }, 0);

    return {
      customer,
      summary: {
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        avgProgress,
        pendingQuotations: pendingQuotations.length,
        outstandingInvoices: outstandingInvoices.length,
        totalOutstanding,
        unreadNotifications: notifications.filter((n) => !n.isRead).length,
      },
      projects,
      pendingQuotations,
      outstandingInvoices: outstandingInvoices.map((inv) => ({
        ...inv,
        outstandingAmount: Math.max(
          Number(inv.total) - Number(inv.paidAmount),
          0,
        ),
        isOverdue:
          inv.status !== 'PAID' && new Date(inv.dueDate) < new Date(),
      })),
      recentPayments,
      latestDocuments,
      notifications,
    };
  }
}