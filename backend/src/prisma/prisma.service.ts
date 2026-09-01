import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connStr = process.env.DATABASE_URL;
    const needsSsl =
      process.env.NODE_ENV === 'production' ||
      connStr?.includes('render.com') ||
      connStr?.includes('supabase') ||
      connStr?.includes('neon') ||
      connStr?.includes('railway') ||
      connStr?.includes('sslmode=');

    const pool = new Pool({
      connectionString: connStr,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}