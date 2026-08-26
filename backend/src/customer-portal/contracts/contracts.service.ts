import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContractsService {
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
      select: { customerId: true, tenantId: true, isActive: true },
    });

    if (!access || !access.isActive) {
      throw new UnauthorizedException(
        'Invalid or inactive portal access key. Please contact your project manager.',
      );
    }

    return { customerId: access.customerId, tenantId: access.tenantId };
  }

  async getContracts(userId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    return this.prisma.contract.findMany({
      where: { customerId, tenantId },
      orderBy: { contractDate: 'desc' },
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
          select: { id: true, projectCode: true, name: true },
        },
      },
    });
  }

  async getContract(userId: string, contractId: string) {
    const { customerId, tenantId } = await this.getPortalContext(userId);

    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, customerId, tenantId },
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
          select: { id: true, projectCode: true, name: true, location: true },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }
}