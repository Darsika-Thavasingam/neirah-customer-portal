import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning existing data...');

  // 1. Delete payment & invoice items first
  await prisma.payment.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});

  // 2. Delete contract & quotation child records
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.contract.deleteMany({});

  // 3. Delete project & customer dependent entities
  await prisma.customerNotification.deleteMany({});
  await prisma.customerVisibleDocument.deleteMany({});
  await prisma.projectPhoto.deleteMany({});
  await prisma.projectUpdate.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.customerProjectAccess.deleteMany({});
  await prisma.customerPortalAccess.deleteMany({});

  // 4. Delete primary parent entities last
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

  // ==========================================
  // SEED CUSTOMER 1: Apex Construction Services
  // ==========================================
  const apexCustomer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      companyName: 'Apex Construction Services',
      contactName: 'Darsika Thavasingam',
      email: 'portal@apexconstruction.lk',
      phone: '+94 77 123 4567',
      address: 'Colombo, Sri Lanka',
      billingInfo: 'Monthly billing',
    },
  });

  const apexUser = await prisma.user.create({
    data: {
      id: 'd4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c',
      tenantId: tenant.id,
      email: 'portal@apexconstruction.lk',
      name: 'Darsika Thavasingam',
      role: 'CUSTOMER',
    },
  });

  await prisma.customerPortalAccess.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      userId: apexUser.id,
      isActive: true,
    },
  });

  const apexProject = await prisma.project.create({
    data: {
      id: '2e79e9a8-1c38-4e71-b506-3232ab8d6ed4',
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      projectCode: 'NEI-APEX-001',
      name: 'Apex HQ Commercial Tower',
      location: 'Colombo 03',
      status: 'IN_PROGRESS',
      progress: 65,
      currentPhase: 'Superstructure Construction',
      projectManagerName: 'Kasun Perera',
      projectManagerContact: '+94 71 555 1234',
      recentUpdate: 'Slab casting for the 12th floor has been completed successfully.',
    },
  });

  await prisma.customerProjectAccess.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      projectId: apexProject.id,
    },
  });

  await prisma.milestone.createMany({
    data: [
      {
        projectId: apexProject.id,
        name: 'Excavation & Groundwork',
        description: 'Excavation and shoring work for basement levels.',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        projectId: apexProject.id,
        name: 'Foundation Piling',
        description: 'Bored piling work for foundation support.',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        projectId: apexProject.id,
        name: 'Superstructure (Concrete)',
        description: 'Casting slabs, columns, and core walls up to 15 floors.',
        status: 'IN_PROGRESS',
        progress: 65,
      },
      {
        projectId: apexProject.id,
        name: 'Façade and MEP Rough-ins',
        description: 'Installation of unitized glass façade panels and main mechanical, electrical and plumbing lines.',
        status: 'UPCOMING',
        progress: 0,
      },
    ],
  });

  await prisma.projectUpdate.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        title: 'Floor 12 Slab Casting Completed',
        update: 'Structural concrete work on Floor 12 has been successfully completed. Formwork is now being erected for Floor 13 columns.',
        postedBy: 'Kasun Perera',
        visibility: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        title: 'Tower Crane Reinforcement',
        update: 'The primary tower crane was reinforced and climbed to its new working height to support upper-level lifting operations.',
        postedBy: 'Kasun Perera',
        visibility: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        title: 'Basement Mechanical Room Handover',
        update: 'Civil works in the main electrical substation room in basement level 1 have been completed for MEP equipment deployment.',
        postedBy: 'Kasun Perera',
        visibility: true,
      },
    ],
  });

  await prisma.projectPhoto.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        photoUrl: 'https://placehold.co/800x500?text=Apex+Groundwork',
        caption: 'Excavation and foundation groundwork completed.',
        category: 'Basement Works',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        photoUrl: 'https://placehold.co/800x500?text=Apex+Slab+Pouring',
        caption: 'Floor 12 slab concrete pouring in progress.',
        category: 'Superstructure',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        photoUrl: 'https://placehold.co/800x500?text=Apex+Overall+View',
        caption: 'Overall perspective view of the emerging commercial tower structure.',
        category: 'Site Progress Overview',
        isCustomerVisible: true,
      },
    ],
  });

  await prisma.customerVisibleDocument.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        category: 'Contract',
        fileName: 'Apex Commercial Tower Agreement.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        category: 'Progress Report',
        fileName: 'Apex Progress Report - August 2026.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        category: 'Approved Drawings',
        fileName: 'Approved Architectural Drawings - Rev 3.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: apexProject.id,
        category: 'Internal',
        fileName: 'Contingency Allocation Report.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: false,
      },
    ],
  });

  await prisma.quotation.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      projectId: apexProject.id,
      quotationNumber: 'QT-APEX-2026-001',
      date: new Date('2026-08-15'),
      validUntil: new Date('2026-09-15'),
      subtotal: 12000000,
      tax: 2160000,
      discount: 250000,
      total: 13910000,
      status: 'SENT',
      terms: 'Milestone billing based on standard structural completion milestones.',
      notes: 'This quotation covers the core superstructure work for the Apex Tower.',
      items: {
        create: [
          {
            description: 'Foundation and Excavation lump sum works',
            quantity: 1,
            unit: 'Lump Sum',
            unitPrice: 5000000,
            tax: 900000,
            discount: 0,
            total: 5900000,
          },
          {
            description: 'Core Superstructure concrete framing',
            quantity: 1,
            unit: 'Lump Sum',
            unitPrice: 7000000,
            tax: 1260000,
            discount: 250000,
            total: 8010000,
          },
        ],
      },
    },
  });

  await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      projectId: apexProject.id,
      contractNumber: 'CT-APEX-2026-001',
      contractDate: new Date('2026-08-15'),
      contractValue: 13910000,
      startDate: new Date('2026-08-16'),
      completionDate: new Date('2027-08-15'),
      status: 'ACTIVE',
      documentUrl: null,
    },
  });

  const apexInvoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      projectId: apexProject.id,
      invoiceNumber: 'INV-APEX-001',
      invoiceDate: new Date('2026-08-15'),
      dueDate: new Date('2026-09-15'),
      contractReference: 'CT-APEX-2026-001',
      subtotal: 5000000,
      tax: 900000,
      discount: 0,
      total: 5900000,
      paidAmount: 4000000,
      status: 'PARTIALLY_PAID',
      documentUrl: null,
      items: {
        create: [
          {
            description: 'Foundation & Excavation Milestone Claim',
            quantity: 1,
            rate: 5000000,
            tax: 900000,
            discount: 0,
            total: 5900000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      invoiceId: apexInvoice.id,
      paymentReference: 'PAY-APEX-001',
      paymentDate: new Date('2026-08-16'),
      paymentMethod: 'Bank Transfer',
      amount: 4000000,
      status: 'COMPLETED',
      receiptReference: 'RCT-APEX-001',
    },
  });

  await prisma.customerNotification.create({
    data: {
      tenantId: tenant.id,
      customerId: apexCustomer.id,
      title: 'Portal Access Activated',
      message: 'Welcome Darsika! Your client dashboard is now active. You can track project updates, milestones, contracts, and view invoices.',
      type: 'INFO',
    },
  });


  // ==========================================
  // SEED CUSTOMER 2: Skyline Developers PLC
  // ==========================================
  const skylineCustomer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      companyName: 'Skyline Developers PLC',
      contactName: 'Kamal Perera',
      email: 'portal@skylinedev.lk',
      phone: '+94 77 987 6543',
      address: 'Kandy, Sri Lanka',
      billingInfo: 'Direct transfer',
    },
  });

  const skylineUser = await prisma.user.create({
    data: {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      tenantId: tenant.id,
      email: 'portal@skylinedev.lk',
      name: 'Kamal Perera',
      role: 'CUSTOMER',
    },
  });

  await prisma.customerPortalAccess.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      userId: skylineUser.id,
      isActive: true,
    },
  });

  const skylineProject = await prisma.project.create({
    data: {
      id: '8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b',
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      projectCode: 'NEI-SKY-002',
      name: 'Skyline Premium Residences',
      location: 'Kandy Central',
      status: 'IN_PROGRESS',
      progress: 30,
      currentPhase: 'Foundation & Basement Construction',
      projectManagerName: 'Nuwan Bandara',
      projectManagerContact: '+94 77 111 2222',
      recentUpdate: 'Concrete pouring for the raft foundation has been successfully completed.',
    },
  });

  await prisma.customerProjectAccess.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      projectId: skylineProject.id,
    },
  });

  await prisma.milestone.createMany({
    data: [
      {
        projectId: skylineProject.id,
        name: 'Site Clearance and Mobilization',
        description: 'Setting up temporary site hoardings, offices, and heavy equipment arrival.',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        projectId: skylineProject.id,
        name: 'Raft Foundation Casting',
        description: 'Continuous heavy concrete pour for main structural raft foundation.',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        projectId: skylineProject.id,
        name: 'Retaining Wall and Substructure',
        description: 'Construction of perimeter basement retaining walls and utility vaults.',
        status: 'IN_PROGRESS',
        progress: 15,
      },
      {
        projectId: skylineProject.id,
        name: 'Ground Floor Slab',
        description: 'Formwork and casting of ground floor commercial transfer slab.',
        status: 'UPCOMING',
        progress: 0,
      },
    ],
  });

  await prisma.projectUpdate.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: skylineProject.id,
        title: 'Raft Foundation Pour Completed',
        update: 'A continuous pour of 1200 cubic meters of Grade 40 concrete was completed over 36 hours for the primary raft foundation.',
        postedBy: 'Nuwan Bandara',
        visibility: true,
      },
      {
        tenantId: tenant.id,
        projectId: skylineProject.id,
        title: 'Waterproofing Works Initiated',
        update: 'Application of self-adhesive waterproofing membrane began along the exterior faces of the basement columns.',
        postedBy: 'Nuwan Bandara',
        visibility: true,
      },
    ],
  });

  await prisma.projectPhoto.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: skylineProject.id,
        photoUrl: 'https://placehold.co/800x500?text=Skyline+Raft+Foundations',
        caption: 'Heavy reinforcement steel ready for raft foundation concrete.',
        category: 'Substructure',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: skylineProject.id,
        photoUrl: 'https://placehold.co/800x500?text=Skyline+Concrete+Pour',
        caption: 'Pump trucks pouring structural concrete into the raft base.',
        category: 'Substructure',
        isCustomerVisible: true,
      },
    ],
  });

  await prisma.customerVisibleDocument.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: skylineProject.id,
        category: 'Contract',
        fileName: 'Skyline Residential Development Contract.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
      {
        tenantId: tenant.id,
        projectId: skylineProject.id,
        category: 'Soil Report',
        fileName: 'Geotechnical Soil Investigation Report.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isCustomerVisible: true,
      },
    ],
  });

  await prisma.quotation.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      projectId: skylineProject.id,
      quotationNumber: 'QT-SKY-2026-001',
      date: new Date('2026-08-10'),
      validUntil: new Date('2026-09-10'),
      subtotal: 9500000,
      tax: 1710000,
      discount: 100000,
      total: 11110000,
      status: 'ACCEPTED',
      terms: 'Progress payment schedule as agreed in main master contract.',
      notes: 'Quotation includes excavation, shoring, raft foundation, and basement levels structural works.',
      items: {
        create: [
          {
            description: 'Site mobilization, shoring, and excavation',
            quantity: 1,
            unit: 'Lump Sum',
            unitPrice: 3500000,
            tax: 630000,
            discount: 0,
            total: 4130000,
          },
          {
            description: 'Raft foundation concrete casting and steel reinforcement',
            quantity: 1,
            unit: 'Lump Sum',
            unitPrice: 6000000,
            tax: 1080000,
            discount: 100000,
            total: 6980000,
          },
        ],
      },
    },
  });

  await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      projectId: skylineProject.id,
      contractNumber: 'CT-SKY-2026-001',
      contractDate: new Date('2026-08-12'),
      contractValue: 11110000,
      startDate: new Date('2026-08-15'),
      completionDate: new Date('2027-10-14'),
      status: 'ACTIVE',
      documentUrl: null,
    },
  });

  const skylineInvoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      projectId: skylineProject.id,
      invoiceNumber: 'INV-SKY-001',
      invoiceDate: new Date('2026-08-15'),
      dueDate: new Date('2026-09-15'),
      contractReference: 'CT-SKY-2026-001',
      subtotal: 3500000,
      tax: 630000,
      discount: 0,
      total: 4130000,
      paidAmount: 4130000,
      status: 'PAID',
      documentUrl: null,
      items: {
        create: [
          {
            description: 'Mobilization & Excavation Completion Milestone Claim',
            quantity: 1,
            rate: 3500000,
            tax: 630000,
            discount: 0,
            total: 4130000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      invoiceId: skylineInvoice.id,
      paymentReference: 'PAY-SKY-001',
      paymentDate: new Date('2026-08-16'),
      paymentMethod: 'Bank Transfer',
      amount: 4130000,
      status: 'COMPLETED',
      receiptReference: 'RCT-SKY-001',
    },
  });

  await prisma.customerNotification.create({
    data: {
      tenantId: tenant.id,
      customerId: skylineCustomer.id,
      title: 'Raft Foundation Casting Complete',
      message: 'Hello Kamal, we have successfully completed casting of the main raft foundation for Skyline Premium Residences.',
      type: 'INFO',
    },
  });

  console.log('Seed completed successfully.');
  console.log(`Apex User ID: ${apexUser.id}`);
  console.log(`Apex Customer ID: ${apexCustomer.id}`);
  console.log(`Apex Project ID: ${apexProject.id}`);
  console.log(`Skyline User ID: ${skylineUser.id}`);
  console.log(`Skyline Customer ID: ${skylineCustomer.id}`);
  console.log(`Skyline Project ID: ${skylineProject.id}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });