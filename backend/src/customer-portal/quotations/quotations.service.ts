import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPortalContext(
    userId: string,
  ): Promise<{ customerId: string; tenantId: string }> {
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
      select: { customerId: true, tenantId: true, isActive: true },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
    }

    return { customerId: access.customerId, tenantId: access.tenantId };
  }

  async getQuotations(userId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    return this.prisma.quotation.findMany({
      where: { customerId, tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quotationNumber: true,
        date: true,
        validUntil: true,
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
        status: true,
        documentUrl: true,
        project: {
          select: { id: true, projectCode: true, name: true },
        },
      },
    });
  }

  async getQuotation(userId: string, quotationId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const quotation = await this.prisma.quotation.findFirst({
      where: { id: quotationId, customerId, tenantId },
      select: {
        id: true,
        quotationNumber: true,
        date: true,
        validUntil: true,
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
        status: true,
        documentUrl: true,
        terms: true,
        notes: true,
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
          },
        },
        project: {
          select: { id: true, projectCode: true, name: true },
        },
        items: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            description: true,
            quantity: true,
            unit: true,
            unitPrice: true,
            tax: true,
            discount: true,
            total: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }
}