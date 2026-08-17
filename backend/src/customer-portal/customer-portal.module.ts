import { Module } from '@nestjs/common';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { QuotationsController } from './quotations/quotations.controller';
import { QuotationsService } from './quotations/quotations.service';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [ContractsModule],
  controllers: [CustomerPortalController, ProjectsController, QuotationsController],
  providers: [CustomerPortalService, ProjectsService, QuotationsService]
})
export class CustomerPortalModule {}