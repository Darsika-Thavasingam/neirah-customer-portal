import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';

describe('CustomerPortalController', () => {
  let controller: CustomerPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerPortalController],
      providers: [
        {
          provide: CustomerPortalService,
          useValue: {
            getCurrentCustomer: jest.fn(),
            getDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomerPortalController>(CustomerPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
