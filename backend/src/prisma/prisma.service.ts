import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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

    super({
      adapter: new PrismaPg({
        connectionString: connStr,
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}