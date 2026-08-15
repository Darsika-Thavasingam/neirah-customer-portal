import { Module } from '@nestjs/common';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';

@Module({
  controllers: [CustomerPortalController, ProjectsController],
  providers: [CustomerPortalService, ProjectsService]
})
export class CustomerPortalModule {}
