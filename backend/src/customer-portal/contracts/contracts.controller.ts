import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';

@ApiTags('Customer Portal - Contracts')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal/contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all legal construction contracts' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved successfully' })
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
  @ApiOperation({ summary: 'Get single legal contract details' })
  @ApiParam({ name: 'contractId', description: 'Unique contract identifier' })
  @ApiResponse({ status: 200, description: 'Contract details retrieved successfully' })
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