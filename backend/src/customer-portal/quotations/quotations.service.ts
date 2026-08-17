import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuotationsService {
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

  async getQuotations(userId: string) {
    const customerId = await this.getCustomerId(userId);

    return this.prisma.quotation.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
    });
  }

  async getQuotation(userId: string, quotationId: string) {
    const customerId = await this.getCustomerId(userId);

    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id: quotationId,
        customerId,
      },
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
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },

        items: {
          orderBy: {
            id: 'asc',
          },
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