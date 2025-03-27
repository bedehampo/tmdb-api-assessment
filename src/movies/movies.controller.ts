import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetMoviesDto } from './dto/get-movies-dto';
import { IGenre } from './interface/IGenre.interface';
import { AuthGuard } from '@nestjs/passport';
import { CustomRequest } from './interface/ICustom-request';
import { RateMovieDto } from './dto/rating-movie.dto';

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
  async getMovies(@Query() dto: GetMoviesDto) {
    return this.moviesService.getMovies(dto);
  }

  // Get single movie
  @Get(':movieId')
  @ApiBearerAuth('jwt')
  async getMovie(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.moviesService.getMovieById(movieId);
  }

  // Rate movie
  @Post('rate-movie')
  @ApiBearerAuth('jwt')
  async rateMovie(@Req() req: CustomRequest, @Body() dto: RateMovieDto) {
    return this.moviesService.rateMovie(req, dto);
  }

  // Get single rating by id
  @Get('rating/:id')
  @ApiBearerAuth('jwt')
  async getRating(@Param('id') id: string) {
    return this.moviesService.getRatingById(id);
  }
}
