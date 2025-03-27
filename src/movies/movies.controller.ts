import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetMoviesDto } from './dto/get-movies-dto';
import { IGenre } from './interface/IGenre.interface';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('movies')
@Controller('movies')
@UseGuards(AuthGuard('jwt'))
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // Get genre controller
  @Get('/genre')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get list of genres' })
  @ApiResponse({ status: 200, description: 'List of genres', type: Object })
  async getGenres(): Promise<{ message: string; data: IGenre[] }> {
    return this.moviesService.getGenres();
  }

  // Get movies controller
  @Get()
  @ApiBearerAuth('jwt')
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
