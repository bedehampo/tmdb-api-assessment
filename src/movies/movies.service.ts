import { Injectable, OnModuleInit } from '@nestjs/common';
import { Movie } from './schema/movies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TmdbService } from 'src/tmdb/tmdb.service';
import { Model } from 'mongoose';
import { Genre } from './schema/genre.schema';
import { GetMoviesDto } from './dto/get-movies-dto';
import { IGenre } from './interface/IGenre.interface';
import { buildMovieQuery } from './utils/search.utils';
import {
  checkAndPopulateMovies,
  fetchMoviesFromApi,
  insertMoviesIntoDb,
} from './utils/movie-population.service';

@Injectable()
export class MoviesService implements OnModuleInit {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(Genre.name) private genreModel: Model<Genre>,
    private tmdbService: TmdbService,
  ) {}

  async onModuleInit() {
    try {
      await checkAndPopulateMovies(this.movieModel, () =>
        this.populateMovies(),
      );
      await this.populateDbWithGenre();
    } catch (error) {
      console.error('Error in onModuleInit:', error.message);
    }
  }

  async populateMovies() {
    await this.populateDBWithMovies(this.tmdbService, this.movieModel);
  }

  // Populate the Db with movies data
  populateDBWithMovies = async (
    tmdbService: TmdbService,
    movieModel: Model<Movie>,
  ) => {
    let page = 1;
    const MAX_PAGE_LIMIT = 500;
    let totalInserted = 0;

    while (page <= MAX_PAGE_LIMIT) {
      try {
        const movies = await fetchMoviesFromApi(tmdbService, page);
        if (!movies.length) {
          console.log(`Page ${page}: No more movies to fetch. Stopping.`);
          break;
        }
        const insertedCount = await insertMoviesIntoDb(
          movieModel,
          movies,
          page,
        );
        totalInserted += insertedCount;
        page += 1;
        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Population stopped at page ${page}:`, error.message);
        break;
      }
    }
    console.log(
      `Movie population completed. Total inserted: ${totalInserted} movies.`,
    );
    return totalInserted;
  };

  // Populate the Db with genre data
  async populateDbWithGenre() {
    try {
      // Get genre qty
      const existingCount = await this.genreModel.countDocuments();
      if (existingCount > 0) return;

      //Fetch the genre data from tmdb
      const genres = await this.tmdbService.fetchGenreList();
      if (!genres || genres.length === 0) {
        // console.warn('No genres fetched from TMDB');
        return;
      }

      // Format genre data
      const genreDocs = genres.map((genre) => ({
        id: genre.id,
        name: genre.name,
      }));

      // Insert into my local db
      await this.genreModel.insertMany(genreDocs, { ordered: false });
      //   console.log(`Synced ${genreDocs.length} genres`);
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
      // Query function
      const query = buildMovieQuery({ search, genre, year });

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
