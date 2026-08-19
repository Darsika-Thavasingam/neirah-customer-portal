import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      customerPortalAccess: {
        findUnique: jest.fn(),
      },
      project: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      customerVisibleDocument: {
        findMany: jest.fn(),
      },
      projectUpdate: {
        findMany: jest.fn(),
      },
      projectPhoto: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('customer can access documents belonging to their project', async () => {
    prismaMock.customerPortalAccess.findUnique.mockResolvedValue({
      customerId: 'customer-1',
      isActive: true,
    });
    prismaMock.project.findFirst.mockResolvedValue({
      id: 'project-1',
      tenantId: 'tenant-1',
    });
    prismaMock.customerVisibleDocument.findMany.mockResolvedValue([
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
    ]);

    const result = await service.getProjectDocuments('user-1', 'project-1');

    expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'project-1',
        customerId: 'customer-1',
      },
      select: {
        id: true,
        tenantId: true,
      },
    });
    expect(prismaMock.customerVisibleDocument.findMany).toHaveBeenCalledWith({
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
    prismaMock.customerPortalAccess.findUnique.mockResolvedValue({
      customerId: 'customer-1',
      isActive: true,
    });
    prismaMock.project.findFirst.mockResolvedValue(null);

    await expect(
      service.getProjectDocuments('user-1', 'project-2'),
    ).rejects.toThrow(NotFoundException);
  });

  it('internal or non-customer-visible documents are excluded', async () => {
    prismaMock.customerPortalAccess.findUnique.mockResolvedValue({
      customerId: 'customer-1',
      isActive: true,
    });
    prismaMock.project.findFirst.mockResolvedValue({
      id: 'project-1',
      tenantId: 'tenant-1',
    });
    prismaMock.customerVisibleDocument.findMany.mockResolvedValue([
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
    ]);

    const result = await service.getProjectDocuments('user-1', 'project-1');

    expect(result.every((document) => document.fileUrl)).toBe(true);
    expect(prismaMock.customerVisibleDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isCustomerVisible: true,
        }),
      }),
    );
  });

  it('inactive or nonexistent portal access is rejected', async () => {
    prismaMock.customerPortalAccess.findUnique.mockResolvedValue(null);

    await expect(
      service.getProjectDocuments('user-1', 'project-1'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
