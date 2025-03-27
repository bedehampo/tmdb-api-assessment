import { Injectable, OnModuleInit } from '@nestjs/common';
import { Movie } from './schema/movies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TmdbService } from 'src/tmdb/tmdb.service';
import { Model } from 'mongoose';
import { Genre } from './schema/genre.schema';
import { GetMoviesDto } from './dto/get-movies-dto';
import { IGenre } from './interface/IGenre.interface';

@Injectable()
export class MoviesService implements OnModuleInit {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(Genre.name) private genreModel: Model<Genre>,
    private tmdbService: TmdbService,
  ) {}
  async onModuleInit() {
    await this.populateDBWithMovies();
    await this.populateDbWithGenre();
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

  // Populate the Db with genre data
  async populateDbWithGenre() {
    try {
      // Get genre qty
      const existingCount = await this.genreModel.countDocuments();
      if (existingCount > 0) return;

      //Fetch the genre data from tmdb
      const genres = await this.tmdbService.fetchGenreList();
      if (!genres || genres.length === 0) {
        console.warn('No genres fetched from TMDB');
        return;
      }

      // Format genre data
      const genreDocs = genres.map((genre) => ({
        id: genre.id,
        name: genre.name,
      }));

      // Insert into my local db
      await this.genreModel.insertMany(genreDocs, { ordered: false });
      console.log(`Synced ${genreDocs.length} genres`);
    } catch (error) {
      throw error;
    }
  }

  // Get Genres
  async getGenres(): Promise<{ message: string; data: IGenre[] }> {
    try {
      const genres = await this.genreModel.find().select('id name');
      return {
        message: 'Genres retrieved successfully',
        data: genres,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get movies
  async getMovies(
    dto: GetMoviesDto,
  ): Promise<{ message: string; data: Movie[] }> {
    const { page, limit, search, genre, year } = dto;
    try {
      const query: any = {};

      // Search by keyword (title or overview)
      if (search) {
        query.$or = [
          { title: { $regex: new RegExp(search, 'i') } },
          { overview: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // Filter by genre
      if (genre !== undefined) {
        query['genres.id'] = genre;
      }

      // Filter by year release
      if (year) {
        const formattedYear = new Date(year).getFullYear();
        const startOfYear = new Date(`${formattedYear}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${formattedYear}-12-31T23:59:59.999Z`);

        // Filtering for the entire year
        query.release_date = { $gte: startOfYear, $lte: endOfYear };
      }
      //   retrieve the fetched movies from my db
      const movies = await this.movieModel
        .find(query)
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
