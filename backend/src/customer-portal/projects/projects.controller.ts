import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('Customer Portal - Projects')
@ApiHeader({
  name: 'x-user-id',
  description: 'User ID of the authenticated customer portal user',
  required: true,
})
@Controller('api/v1/customer-portal/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all assigned construction projects' })
  @ApiResponse({ status: 200, description: 'Projects fetched successfully' })
  @ApiResponse({ status: 401, description: 'x-user-id header is missing' })
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
  @ApiOperation({ summary: 'Get daily site progress updates for a project' })
  @ApiParam({ name: 'projectId', description: 'Unique project identifier' })
  @ApiResponse({ status: 200, description: 'Project site updates retrieved successfully' })
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
  @ApiOperation({ summary: 'Get construction milestone schedule for a project' })
  @ApiParam({ name: 'projectId', description: 'Unique project identifier' })
  @ApiResponse({ status: 200, description: 'Project milestones retrieved successfully' })
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
  @ApiOperation({ summary: 'Get site photos gallery for a project' })
  @ApiParam({ name: 'projectId', description: 'Unique project identifier' })
  @ApiResponse({ status: 200, description: 'Project photos retrieved successfully' })
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
  @ApiOperation({ summary: 'Get drawings, blueprints, and files for a project' })
  @ApiParam({ name: 'projectId', description: 'Unique project identifier' })
  @ApiResponse({ status: 200, description: 'Project documents retrieved successfully' })
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
  @ApiOperation({ summary: 'Get detailed overview of a single project' })
  @ApiParam({ name: 'projectId', description: 'Unique project identifier' })
  @ApiResponse({ status: 200, description: 'Project details retrieved successfully' })
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