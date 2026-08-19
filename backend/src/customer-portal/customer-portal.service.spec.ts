import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPortalService } from './customer-portal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerPortalService', () => {
  let service: CustomerPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPortalService,
        {
          provide: PrismaService,
          useValue: {
            customerPortalAccess: { findFirst: jest.fn() },
            project: { count: jest.fn() },
            quotation: { count: jest.fn() },
            invoice: { count: jest.fn(), findMany: jest.fn() },
            payment: { aggregate: jest.fn(), findMany: jest.fn() },
            customerVisibleDocument: { findMany: jest.fn() },
            projectUpdate: { findMany: jest.fn() },
            customerNotification: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<CustomerPortalService>(CustomerPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
