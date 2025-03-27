import { TmdbService } from 'src/tmdb/tmdb.service';
import { Model } from 'mongoose';
import { Movie } from '../schema/movies.schema';

// Fetch movies from the TMDB API with retry logic
export const fetchMoviesFromApi = async (
  tmdbService: TmdbService,
  page: number,
  retries = 3,
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const movies = await tmdbService.fetchPopularMovies(page);
      console.log(
        `Page ${page}: Fetched ${movies.length} movies from TMDB (Attempt ${attempt}).`,
      );
      return movies || [];
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `Page ${page}: Rate limit hit. Waiting ${delay}ms before retry ${attempt + 1}.`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(
          `Page ${page}: Error fetching movies from TMDB (Attempt ${attempt}):`,
          error.message,
        );
        if (attempt === retries) throw error;
      }
    }
  }
  throw new Error(
    `Page ${page}: Failed to fetch movies after ${retries} attempts.`,
  );
};

// Prepare the movie documents for insertion
export const prepareMoviesForInsertion = (movies: any[]) => {
  const prepared = movies
    .filter((movie) => movie.id && movie.title) // Ensure required fields
    .map((movie) => ({
      movieId: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      release_date: movie.release_date ? new Date(movie.release_date) : null,
      genres: movie.genre_ids || [],
    }));
  console.log(`Prepared ${prepared.length} movies for insertion.`);
  return prepared;
};

// Insert movies into the database
export const insertMoviesIntoDb = async (
  movieModel: Model<Movie>,
  movies: any[],
  page: number,
) => {
  try {
    const movieDocs = prepareMoviesForInsertion(movies);
    if (movieDocs.length === 0) {
      console.log(`Page ${page}: No valid movies to insert.`);
      return 0;
    }
    const result = await movieModel.insertMany(movieDocs, { ordered: false });
    console.log(`Page ${page}: Inserted ${result.length} movies.`);
    return result.length;
  } catch (error) {
    console.error(
      `Page ${page}: Error inserting movies into DB:`,
      error.message,
    );
    throw error;
  }
};

// Check if movies are already populated
export const checkAndPopulateMovies = async (
  movieModel: Model<Movie>,
  populateMoviesFunction: () => Promise<void>,
) => {
  try {
    const movieCount = await movieModel.countDocuments();
    console.log(`Current movie count: ${movieCount}`);
    const targetCount = 9677; // Configurable target
    if (movieCount >= targetCount) {
      console.log('Movies are already populated. Skipping population.');
    } else {
      console.log(
        `Movies not fully populated (${movieCount}/${targetCount}). Proceeding with population.`,
      );
      await populateMoviesFunction();
    }
  } catch (error) {
    console.error('Error checking movie count:', error.message);
    throw error;
  }
};
