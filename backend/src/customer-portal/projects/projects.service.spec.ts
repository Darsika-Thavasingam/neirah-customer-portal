import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('includes customer contact data while keeping project manager details', async () => {
    const prisma = {
      customerPortalAccess: {
        findUnique: jest.fn().mockResolvedValue({
          customerId: 'customer-1',
          isActive: true,
        }),
      },
      project: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'project-1',
          projectManagerContact: '+94 71 555 1234',
          customer: {
            companyName: 'Acme Build',
            contactName: 'Jane Doe',
            email: 'jane@acme.com',
            phone: '+94 77 222 3333',
          },
        }),
      },
    } as any;

    const serviceWithMock = new ProjectsService(prisma);

    const result = await serviceWithMock.getProject('user-1', 'project-1');

    expect(result.projectManagerContact).toBe('+94 71 555 1234');
    expect(result.customer).toEqual({
      companyName: 'Acme Build',
      contactName: 'Jane Doe',
      email: 'jane@acme.com',
      phone: '+94 77 222 3333',
    });
  });
});
