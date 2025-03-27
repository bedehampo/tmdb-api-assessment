import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { TmdbService } from 'src/tmdb/tmdb.service';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getModelToken('Movie'),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn() },
        },
        {
          provide: getModelToken('Genre'),
          useValue: {
            find: jest.fn(),
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
          },
        },
        {
          provide: getModelToken('Rating'),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn() },
        },
        {
          provide: TmdbService,
          useValue: { fetchGenreList: jest.fn(), fetchMovies: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'mock-api-key') },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
