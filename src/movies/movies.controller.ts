import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMoviesDto } from './dto/get-movies-dto';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: 'List movies with pagination and filters' })
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by keyword (in title or overview)',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    type: Number,
    description: 'Filter by genre ID',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Filter by release year (YYYY)',
  })
  @ApiResponse({ status: 200, description: 'List of movies', type: [Object] })
  async getMovies(@Query() dto: GetMoviesDto) {
    return this.moviesService.getMovies(dto);
  }
}
