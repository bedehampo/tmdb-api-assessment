import { ISearchParams } from '../interface/Isearch.interface';

export const buildMovieQuery = (params: ISearchParams): any => {
  const query: any = {};

  // Search by keyword (title or overview)
  if (params.search) {
    query.$or = [
      { title: { $regex: new RegExp(params.search, 'i') } },
      { overview: { $regex: new RegExp(params.search, 'i') } },
    ];
  }

  // Filter by genre
  if (params.genre !== undefined) {
    query['genres.id'] = params.genre;
  }

  // Filter by year release
  if (params.year) {
    const formattedYear = new Date(params.year).getFullYear();
    const startOfYear = new Date(`${formattedYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${formattedYear}-12-31T23:59:59.999Z`);

    // Filtering for the entire year
    query.release_date = { $gte: startOfYear, $lte: endOfYear };
  }

  return query;
};
