import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Movie } from './schema/movies.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TmdbService } from 'src/tmdb/tmdb.service';
import { Model, Types } from 'mongoose';
import { Genre } from './schema/genre.schema';
import { GetMoviesDto } from './dto/get-movies-dto';
import { IGenre } from './interface/IGenre.interface';
import { buildMovieQuery } from './utils/search.utils';
import {
  checkAndPopulateMovies,
  fetchMoviesFromApi,
  insertMoviesIntoDb,
} from './utils/movie-population.service';
import { Rating } from './schema/rating.schema';
import { RateMovieDto } from './dto/rating-movie.dto';
import { CustomRequest } from './interface/ICustom-request';

@Injectable()
export class MoviesService implements OnModuleInit {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(Genre.name) private genreModel: Model<Genre>,
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
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

      console.log(typeof page);

      //   retrieve the fetched movies from my db
      const movies = await this.movieModel
        .find(query)
        .populate({ path: 'ratings', select: 'rating comment' })
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

  // Get single movies
  async getMovieById(
    movieId: number,
  ): Promise<{ message: string; data: Movie }> {
    try {
      const movie = await this.movieModel
        .findOne({ movieId: movieId })
        .populate({ path: 'ratings', select: 'rating comment' });

      if (!movie) {
        throw new NotFoundException(`Movie with ID ${movieId} not found`);
      }

      return {
        message: 'Movie fetched successfully',
        data: movie as unknown as Movie,
      };
    } catch (error) {
      throw error;
    }
  }

  // Rate movies
  async rateMovie(req: CustomRequest, dto: RateMovieDto) {
    const { movieId, rating, comment } = dto;

    const reviewerId = new Types.ObjectId(req.user.userId);

    // check if the movies exist
    const checkMovie = await this.movieModel.findOne({
      movieId: movieId,
    });
    if (!checkMovie) throw new NotFoundException('movie not found');

    try {
      // check for existing rating
      const existingRating = await this.ratingModel.findOne({
        userId: reviewerId,
        movieId: checkMovie._id,
      });

      if (existingRating) {
        existingRating.rating = rating;
        existingRating.comment = comment;
        await existingRating.save();
      } else {
        const newRating = new this.ratingModel({
          movieId: checkMovie._id,
          userId: reviewerId,
          rating,
          comment,
        });
        await newRating.save();
        checkMovie.ratings.push(newRating._id as Types.ObjectId);
        await checkMovie.save();
      }

      // Recalculate and update the average rating after adding/updating a rating
      await this.updateMovieAverageRating(checkMovie._id as Types.ObjectId);

      return {
        message: 'Movie rated successfully',
        data: {
          movieId: checkMovie.movieId,
          rating,
          comment,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getRatingById(id: string): Promise<{ message: string; data: any }> {
    try {
      const rating = await this.ratingModel.findById(id).populate({
        path: 'userId',
        select: 'username',
      });

      if (!rating) {
        throw new NotFoundException(`Rating with ID ${id} not found`);
      }

      return {
        message: 'Rating fetched successfully',
        data: rating,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateMovieAverageRating(movieId: Types.ObjectId) {
    try {
      const movie = await this.movieModel.findById(movieId);

      if (!movie) {
        return;
      }

      const ratings = await this.ratingModel.find({ movieId: movieId });

      if (ratings.length === 0) {
        movie.avgRating = 0;
      } else {
        const totalRating = ratings.reduce(
          (sum, rating) => sum + rating.rating,
          0,
        );
        movie.avgRating = totalRating / ratings.length;
      }

      await movie.save();
    } catch (error) {
      console.error('Error updating average rating:', error);
    }
  }
}
