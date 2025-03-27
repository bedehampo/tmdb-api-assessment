import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: 'List movies with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'List of movies', type: [Object] })
  async getMovies(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.moviesService.getMovies(page, limit);
  }
}
