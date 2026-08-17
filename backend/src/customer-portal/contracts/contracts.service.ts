import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCustomerId(userId: string): Promise<string> {
    const access = await this.prisma.customerPortalAccess.findFirst({
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

  async getContracts(userId: string) {
    const customerId = await this.getCustomerId(userId);

    return this.prisma.contract.findMany({
      where: {
        customerId,
      },
      orderBy: {
        contractDate: 'desc',
      },
      select: {
        id: true,
        contractNumber: true,
        contractDate: true,
        contractValue: true,
        startDate: true,
        completionDate: true,
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

  async getContract(userId: string, contractId: string) {
    const customerId = await this.getCustomerId(userId);

    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        customerId,
      },
      select: {
        id: true,
        contractNumber: true,
        contractDate: true,
        contractValue: true,
        startDate: true,
        completionDate: true,
        status: true,
        documentUrl: true,
        createdAt: true,
        updatedAt: true,

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
            location: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }
}