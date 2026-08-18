import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPortalContext(userId: string) {
    const access = await this.prisma.customerPortalAccess.findUnique({
      where: {
        userId,
      },
      select: {
        tenantId: true,
        customerId: true,
        isActive: true,
      },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Customer portal access is not active',
      );
    }

    return {
      tenantId: access.tenantId,
      customerId: access.customerId,
    };
  }

  async getPayments(userId: string) {
    const { tenantId, customerId } =
      await this.getPortalContext(userId);

    return this.prisma.payment.findMany({
      where: {
        tenantId,
        customerId,
      },
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });
  }

  async getPaymentSummary(userId: string) {
    const { tenantId, customerId } =
      await this.getPortalContext(userId);

    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        customerId,
      },
      select: {
        amount: true,
      },
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        customerId,
      },
      select: {
        total: true,
        paidAmount: true,
      },
    });

    const totalInvoiced = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.total),
      0,
    );

    const totalOutstanding = invoices.reduce(
      (sum, invoice) =>
        sum + Math.max(Number(invoice.total) - Number(invoice.paidAmount), 0),
      0,
    );

    return {
      totalPaid,
      totalInvoiced,
      totalOutstanding,
      paymentCount: payments.length,
    };
  }
}