import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schema/movies.schema';
import { TmdbService } from 'src/tmdb/tmdb.service';
import { ConfigModule } from '@nestjs/config';
import { Genre, GenreSchema } from './schema/genre.schema';
import { Rating, RatingSchema } from './schema/rating.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Genre.name, schema: GenreSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService, TmdbService],
})
export class MoviesModule {}
