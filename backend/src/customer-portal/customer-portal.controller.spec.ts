import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPortalController } from './customer-portal.controller';

describe('CustomerPortalController', () => {
  let controller: CustomerPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerPortalController],
    }).compile();

    controller = module.get<CustomerPortalController>(CustomerPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
