import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  it('customer can access documents belonging to their project', async () => {
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
          tenantId: 'tenant-1',
        }),
      },
      customerVisibleDocument: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'doc-1',
            category: 'Contract',
            fileName: 'Agreement.pdf',
            fileUrl: 'https://example.com/a.pdf',
            uploadedAt: '2026-08-15T00:00:00.000Z',
            project: {
              id: 'project-1',
              projectCode: 'PRJ-001',
              name: 'Site Build',
            },
          },
        ]),
      },
    } as any;

    const serviceWithMock = new ProjectsService(prisma);

    const result = await serviceWithMock.getProjectDocuments('user-1', 'project-1');

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'project-1',
        customerId: 'customer-1',
      },
      select: {
        id: true,
        tenantId: true,
      },
    });
    expect(prisma.customerVisibleDocument.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 'project-1',
        tenantId: 'tenant-1',
        isCustomerVisible: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      select: {
        id: true,
        category: true,
        fileName: true,
        fileUrl: true,
        uploadedAt: true,
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
    });
    expect(result).toHaveLength(1);
    expect(result[0].fileName).toBe('Agreement.pdf');
  });

  it('customer cannot access another customer project documents', async () => {
    const prisma = {
      customerPortalAccess: {
        findUnique: jest.fn().mockResolvedValue({
          customerId: 'customer-1',
          isActive: true,
        }),
      },
      project: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as any;

    const serviceWithMock = new ProjectsService(prisma);

    await expect(
      serviceWithMock.getProjectDocuments('user-1', 'project-2'),
    ).rejects.toThrow(NotFoundException);
  });

  it('internal or non-customer-visible documents are excluded', async () => {
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
          tenantId: 'tenant-1',
        }),
      },
      customerVisibleDocument: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'doc-1',
            category: 'Approved Drawings',
            fileName: 'Approved.pdf',
            fileUrl: 'https://example.com/approved.pdf',
            uploadedAt: '2026-08-15T00:00:00.000Z',
            project: {
              id: 'project-1',
              projectCode: 'PRJ-001',
              name: 'Site Build',
            },
          },
        ]),
      },
    } as any;

    const serviceWithMock = new ProjectsService(prisma);
    const result = await serviceWithMock.getProjectDocuments('user-1', 'project-1');

    expect(result.every((document) => document.fileUrl)).toBe(true);
    expect(prisma.customerVisibleDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isCustomerVisible: true,
        }),
      }),
    );
  });

  it('inactive or nonexistent portal access is rejected', async () => {
    const prisma = {
      customerPortalAccess: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as any;

    const serviceWithMock = new ProjectsService(prisma);

    await expect(
      serviceWithMock.getProjectDocuments('user-1', 'project-1'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
