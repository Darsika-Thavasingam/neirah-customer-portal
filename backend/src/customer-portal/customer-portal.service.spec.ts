import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPortalService } from './customer-portal.service';

describe('CustomerPortalService', () => {
  let service: CustomerPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerPortalService],
    }).compile();

    service = module.get<CustomerPortalService>(CustomerPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
