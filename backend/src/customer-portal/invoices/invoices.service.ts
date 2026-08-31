import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPortalContext(userId: string) {
    const cleanId = userId?.trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!cleanId || !uuidRegex.test(cleanId)) {
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
        tenantId: true,
        customerId: true,
        isActive: true,
      },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
    }

    return {
      tenantId: access.tenantId,
      customerId: access.customerId,
    };
  }

  async getInvoices(userId: string) {
    const { tenantId, customerId } =
      await this.getPortalContext(userId);

    return this.prisma.invoice.findMany({
      where: {
        tenantId,
        customerId,
      },
      orderBy: {
        invoiceDate: 'desc',
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        contractReference: true,
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
        paidAmount: true,
        status: true,
        documentUrl: true,

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

  async getInvoice(userId: string, invoiceId: string) {
    // Return 404 immediately if invoiceId is not a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invoiceId)) {
      throw new NotFoundException('Invoice not found');
    }

    const { tenantId, customerId } =
      await this.getPortalContext(userId);

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId,
        customerId,
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        contractReference: true,
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
        paidAmount: true,
        status: true,
        documentUrl: true,

        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
          },
        },

        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },

        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            rate: true,
            tax: true,
            discount: true,
            total: true,
          },
        },

        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
          select: {
            id: true,
            paymentReference: true,
            paymentDate: true,
            paymentMethod: true,
            amount: true,
            status: true,
            receiptReference: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async getOutstandingInvoices(userId: string) {
    const { tenantId, customerId } =
      await this.getPortalContext(userId);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        customerId,
        status: {
          not: 'PAID',
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        total: true,
        paidAmount: true,
        status: true,

        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
    });

    return invoices.map((invoice) => {
      const total = Number(invoice.total);
      const paid = Number(invoice.paidAmount);
      const outstanding = Math.max(total - paid, 0);

      const now = new Date();
      const dueDate = new Date(invoice.dueDate);

      const daysOverdue =
        dueDate < now
          ? Math.floor(
              (now.getTime() - dueDate.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

      return {
        ...invoice,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        outstandingAmount: outstanding,
        daysOverdue,
      };
    });
  }
}