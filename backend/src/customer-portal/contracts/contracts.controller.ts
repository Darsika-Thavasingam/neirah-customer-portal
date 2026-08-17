import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('api/v1/customer-portal/contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
  ) {}

  @Get()
  async getContracts(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.contractsService.getContracts(userId);
  }

  @Get(':contractId')
  async getContract(
    @Headers('x-user-id') userId: string | undefined,
    @Param('contractId') contractId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.contractsService.getContract(
      userId,
      contractId,
    );
  }
}