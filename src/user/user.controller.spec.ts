import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// Mock User Model
const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

// Mock UserService
const mockUserService = {
  login: jest.fn(),
  autoCreateDefaultUsers: jest.fn(), // Prevent onModuleInit side effects
};

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-token'),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    // Mock setup for login
    const hashedPassword = await bcrypt.hash('testPassword', 10);
    const mockUser = {
      _id: '123',
      username: 'testUser',
      password: hashedPassword,
    };
    mockUserModel.findOne.mockImplementation((query) => {
      if (query.username === 'testUser') {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });
    mockUserService.login.mockImplementation(async (dto) => {
      const user = await mockUserModel.findOne({ username: dto.username });
      if (!user) throw new NotFoundException('user not found');
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
      return {
        message: 'User login successfully',
        token: 'mock-token',
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login successfully with correct credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: 'testUser', password: 'testPassword' })
      .expect(200);

    expect(response.body).toEqual({
      message: 'User login successfully',
      token: 'mock-token',
    });
  });

  it('should return 404 if user not found', async () => {
    await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: 'nonexistentuser', password: 'testPassword' })
      .expect(404);
  });

  it('should return 401 if password is invalid', async () => {
    await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: 'testUser', password: 'wrongPassword' })
      .expect(401);
  });

  it('should return 400 if username is missing', async () => {
    await request(app.getHttpServer())
      .post('/user/login')
      .send({ password: 'testPassword' })
      .expect(400);
  });

  it('should return 400 if password is missing', async () => {
    await request(app.getHttpServer())
      .post('/user/login')
      .send({ username: 'testUser' })
      .expect(400);
  });
});
