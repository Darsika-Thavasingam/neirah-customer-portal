import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerPortalModule } from './customer-portal/customer-portal.module';

@Module({
  imports: [PrismaModule, CustomerPortalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}