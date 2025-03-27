import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Movie } from './schema/movies.schema';
import { Rating } from './schema/rating.schema';
import { AppModule } from 'src/app.module';
import { MoviesService } from './movies.service';

// Mock AuthGuard to simulate an authenticated user
const mockAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: new Types.ObjectId(), username: 'testuser' }; // Mock user
    return true;
  },
};

describe('MoviesController (Integration)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let mongooseConnection: Connection;
  let moviesService: MoviesService;
  let jwtService: JwtService;
  let movieModel: Model<Movie>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ratingModel: Model<Rating>;
  let token: string;
  let mockUserId: Types.ObjectId;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Create testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    })
      .overrideGuard(AuthGuard('jwt')) // Override JWT AuthGuard
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    moviesService = moduleFixture.get<MoviesService>(MoviesService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    movieModel = moduleFixture.get<Model<Movie>>(getModelToken('Movie'));
    ratingModel = moduleFixture.get<Model<Rating>>(getModelToken('Rating'));

    // Generate a mock userId and JWT token
    mockUserId = new Types.ObjectId();
    token = jwtService.sign(
      { sub: mockUserId.toString(), username: 'testuser' },
      // Use your env secret or fallback
      { secret: process.env.SECRET_TOKEN || 'default-secret' },
    );

    await app.init();
    mongooseConnection = moduleFixture.get<Connection>('MongooseConnection');
  });

  afterEach(async () => {
    // Clear database after each test
    await mongooseConnection.dropDatabase();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /movies/genre', () => {
    it('should return a list of genres', async () => {
      // Seed genre data (normally done in onModuleInit, but for testing)
      await movieModel.create({
        movieId: 1,
        title: 'Test Movie',
        overview: 'A test movie',
        release_date: new Date('2023-01-01'),
        genres: [28],
        ratings: [],
        avgRating: 0,
      });

      const response = await request(app.getHttpServer())
        .get('/movies/genre')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Genres retrieved successfully',
      );
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /movies', () => {
    it('should return a paginated list of movies', async () => {
      // Seed test data
      await movieModel.create({
        movieId: 1,
        title: 'Test Movie',
        overview: 'A test movie',
        release_date: new Date('2023-01-01'),
        genres: [28],
        ratings: [],
        avgRating: 0,
      });

      const response = await request(app.getHttpServer())
        .get('/movies?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Movies fetched successfully',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Movie');
      expect(response.body.data[0].avgRating).toBe(0);
    });
  });

  describe('GET /movies/:movieId', () => {
    it('should return a single movie by movieId', async () => {
      // Seed test data
      await movieModel.create({
        movieId: 2,
        title: 'Inception',
        overview: 'A mind-bending movie',
        release_date: new Date('2010-07-16'),
        genres: [53],
        ratings: [],
        avgRating: 0,
      });

      const response = await request(app.getHttpServer())
        .get('/movies/2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Movie fetched successfully',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe('Inception');
      expect(response.body.data.movieId).toBe(2);
    });
  });

  describe('POST /movies/rate-movie', () => {
    it('should rate a movie and update avgRating', async () => {
      // Seed test data
      await movieModel.create({
        movieId: 3,
        title: 'The Matrix',
        overview: 'A sci-fi classic',
        release_date: new Date('1999-03-31'),
        genres: [28],
        ratings: [],
        avgRating: 0,
      });

      const response = await request(app.getHttpServer())
        .post('/movies/rate-movie')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: 3, rating: 4, comment: 'Great movie!' })
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Movie rated successfully',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.movieId).toBe(3);
      expect(response.body.data.rating).toBe(4);
      expect(response.body.data.comment).toBe('Great movie!');

      // Verify the movie's ratings array and avgRating
      const updatedMovie = await moviesService.getMovieById(3);
      expect(updatedMovie.data.ratings.length).toBe(1);
      expect(updatedMovie.data.avgRating).toBe(4);
    });

    it('should update an existing rating', async () => {
      // Seed test data
      await movieModel.create({
        movieId: 5,
        title: 'Die Hard',
        overview: 'An action classic',
        release_date: new Date('1988-07-15'),
        genres: [28],
        ratings: [],
        avgRating: 0,
      });

      // First rating
      await request(app.getHttpServer())
        .post('/movies/rate-movie')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: 5, rating: 3, comment: 'Good!' })
        .expect(201);

      // Update rating
      const response = await request(app.getHttpServer())
        .post('/movies/rate-movie')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: 5, rating: 5, comment: 'Awesome!' })
        .expect(201);

      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.comment).toBe('Awesome!');

      // Verify the movie's ratings array and avgRating
      const updatedMovie = await moviesService.getMovieById(5);
      expect(updatedMovie.data.ratings.length).toBe(1);
      expect(updatedMovie.data.avgRating).toBe(5);
    });
  });

  describe('GET /movies/rating/:id', () => {
    it('should return a single rating by ID', async () => {
      // Seed test data
      const movie = await movieModel.create({
        movieId: 4,
        title: 'Avatar',
        overview: 'A visually stunning movie',
        release_date: new Date('2009-12-18'),
        genres: [878],
        ratings: [],
        avgRating: 0,
      });

      // Add a rating
      await request(app.getHttpServer())
        .post('/movies/rate-movie')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: 4, rating: 5, comment: 'Amazing visuals!' })
        .expect(201);

      // Get the rating ID from the movie's ratings array
      const updatedMovie = await moviesService.getMovieById(4);
      const ratingId = updatedMovie.data.ratings[0]._id;

      const response = await request(app.getHttpServer())
        .get(`/movies/rating/${ratingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Rating fetched successfully',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.comment).toBe('Amazing visuals!');
      expect(response.body.data.userId.username).toBe('testuser');
      expect(response.body.data.movieId.toString()).toBe(movie._id.toString());
    });
  });
});
