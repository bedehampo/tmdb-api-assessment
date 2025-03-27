import { Injectable, OnModuleInit } from '@nestjs/common';
import { Movie } from './schema/movies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TmdbService } from 'src/tmdb/tmdb.service';
import { Model } from 'mongoose';

@Injectable()
export class MoviesService implements OnModuleInit {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private tmdbService: TmdbService,
  ) {}
  async onModuleInit() {
    await this.populateDBWithMovies();
  }

  // Populate the Db with movies data
  async populateDBWithMovies() {
    try {
      // Get all the movies of tmdb
      const movies = await this.tmdbService.fetchPopularMovies();
      //   console.log('Fetched Movies:', movies);
      // confirm movies data fetched
      if (!movies || !Array.isArray(movies)) {
        console.warn('No valid movies data returned');
        return;
      }
      //   console.log('Number of movies fetched:', movies.length);

      // format the movies data
      const movieDocs = movies.map((movie) => ({
        movieId: movie.id,
        title: movie.title,
        overview: movie.overview,
        release_date: movie.release_date,
        genres: movie.genre_ids.map((id) => ({ id })),
      }));
      //   console.log('Movie Docs to Insert:', movieDocs);

      // insert the movie data into the db
      await this.movieModel
        .insertMany(movieDocs, { ordered: false })
        .catch((err) => {
          if (err.code === 11000) {
            console.log('Duplicate movies skipped:', err.writeErrors);
            return err.insertedDocs || []; // Return inserted docs if any
          }
          throw err;
        });
      //   console.log('Inserted Docs:', result);
    } catch (error) {
      throw error;
    }
  }

  // Get movies
  async getMovies(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ message: string; data: Movie[] }> {
    try {
      //   retrieve the fetched movies from my db
      const movies = await this.movieModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        message: 'Movies fetched successfully',
        data: movies as unknown as Movie[],
      };
    } catch (error) {
      throw error;
    }
  }
}
