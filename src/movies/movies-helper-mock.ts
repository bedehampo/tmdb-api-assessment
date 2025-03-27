import { Types } from 'mongoose';
import { Movie } from './schema/movies.schema';

export const createMockMovie = (overrides: Partial<Movie> = {}): any => {
  const defaultMovie: Partial<Movie> = {
    movieId: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    release_date: new Date(),
    genres: [1, 2],
    ratings: [],
    avgRating: 0,
    _id: new Types.ObjectId().toString(),
  };

  return {
    ...defaultMovie,
    ...overrides,
  };
};
