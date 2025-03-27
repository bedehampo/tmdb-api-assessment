import { Test, TestingModule } from '@nestjs/testing';
import { TmdbService } from './tmdb.service';
import { ConfigService } from '@nestjs/config';

describe('TmdbService', () => {
  let service: TmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'TMDB_API_KEY') return 'mock-api-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
