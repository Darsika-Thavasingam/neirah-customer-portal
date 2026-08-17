import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning existing data...');
  await prisma.customerNotification.deleteMany({});
  await prisma.customerVisibleDocument.deleteMany({});
  await prisma.projectPhoto.deleteMany({});
  await prisma.projectUpdate.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.customerProjectAccess.deleteMany({});
  await prisma.customerPortalAccess.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Seeding database...');

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Neirah Construction Demo',
    },
  });

  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      companyName: 'ABC Construction Holdings',
      contactName: 'John Silva',
      email: 'john.silva@example.com',
      phone: '+94 77 123 4567',
      address: 'Colombo, Sri Lanka',
      billingInfo: 'Monthly billing',
    },
  });

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'john.silva@example.com',
      name: 'John Silva',
      role: 'CUSTOMER',
    },
  });

  await prisma.customerPortalAccess.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      userId: user.id,
      isActive: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      projectCode: 'NEI-2026-001',
      name: 'ABC Office Complex',
      location: 'Colombo',
      status: 'IN_PROGRESS',
      progress: 45,
      currentPhase: 'Structural Work',
      projectManagerName: 'Kasun Perera',
      projectManagerContact: '+94 71 555 1234',
      recentUpdate: 'Structural work is progressing according to schedule.',
    },
  });

  await prisma.customerProjectAccess.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      projectId: project.id,
    },
  });

  await prisma.milestone.createMany({
    data: [
      {
        projectId: project.id,
        name: 'Site Preparation',
        description: 'Initial site preparation and groundwork.',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        projectId: project.id,
        name: 'Foundation',
        description: 'Foundation construction.',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        projectId: project.id,
        name: 'Structural Work',
        description: 'Main structural construction.',
        status: 'IN_PROGRESS',
        progress: 45,
      },
      {
        projectId: project.id,
        name: 'Finishing',
        description: 'Interior and exterior finishing.',
        status: 'UPCOMING',
        progress: 0,
      },
    ],
  });

  await prisma.projectUpdate.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: project.id,
        title: 'Structural Work Progress Update',
        update:
          'Structural work has reached 45% completion and is progressing according to the planned schedule.',
        postedBy: 'Kasun Perera',
        visibility: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        title: 'Foundation Work Completed',
        update:
          'Foundation construction has been completed successfully. The project has now moved into the structural work phase.',
        postedBy: 'Kasun Perera',
        visibility: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        title: 'Site Preparation Completed',
        update:
          'Initial site preparation and groundwork have been completed successfully.',
        postedBy: 'Kasun Perera',
        visibility: true,
      },
    ],
  });

  await prisma.projectPhoto.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: project.id,
        photoUrl: 'https://placehold.co/800x500?text=Site+Preparation',
        caption: 'Site preparation and groundwork completed.',
        category: 'Site Preparation',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        photoUrl: 'https://placehold.co/800x500?text=Foundation',
        caption: 'Foundation construction completed.',
        category: 'Foundation',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        photoUrl: 'https://placehold.co/800x500?text=Structural+Work',
        caption: 'Current structural work in progress.',
        category: 'Structural Work',
        isCustomerVisible: true,
      },
    ],
  });

  await prisma.customerVisibleDocument.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: project.id,
        category: 'Contract',
        fileName: 'Construction Agreement.pdf',
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        category: 'Progress Report',
        fileName: 'August Progress Report.pdf',
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        category: 'Approved Drawings',
        fileName: 'Approved Project Drawings.pdf',
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        category: 'Internal',
        fileName: 'Internal Cost Report.pdf',
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: false,
      },
    ],
  });

  await prisma.customerNotification.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      title: 'Welcome to the Customer Portal',
      message:
        'Your project information is now available through the Neirah Customer Portal.',
      type: 'INFO',
    },
  });

  console.log('Seed completed successfully.');
  console.log(`Demo user ID: ${user.id}`);
  console.log(`Demo customer ID: ${customer.id}`);
  console.log(`Demo project ID: ${project.id}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });