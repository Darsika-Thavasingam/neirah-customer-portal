import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('api/v1/customer-portal/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async getProjects(
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.projectsService.getProjects(userId);
  }

  @Get(':projectId/updates')
  async getProjectUpdates(
    @Headers('x-user-id') userId: string | undefined,
    @Param('projectId') projectId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.projectsService.getProjectUpdates(
      userId,
      projectId,
    );
  }

  @Get(':projectId/milestones')
  async getProjectMilestones(
    @Headers('x-user-id') userId: string | undefined,
    @Param('projectId') projectId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.projectsService.getProjectMilestones(
      userId,
      projectId,
    );
  }

  @Get(':projectId/photos')
  async getProjectPhotos(
    @Headers('x-user-id') userId: string | undefined,
    @Param('projectId') projectId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.projectsService.getProjectPhotos(
      userId,
      projectId,
    );
  }

  @Get(':projectId/documents')
  async getProjectDocuments(
    @Headers('x-user-id') userId: string | undefined,
    @Param('projectId') projectId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.projectsService.getProjectDocuments(
      userId,
      projectId,
    );
  }

  @Get(':projectId')
  async getProject(
    @Headers('x-user-id') userId: string | undefined,
    @Param('projectId') projectId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'x-user-id header is required',
      );
    }

    return this.projectsService.getProject(
      userId,
      projectId,
    );
  }
}