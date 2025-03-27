import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TmdbService } from './tmdb/tmdb.service';
import { MoviesModule } from './movies/movies.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/admin`,
        // uri: `mongodb://${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}`,
        retryAttempts: 10,
        retryDelay: 1000,
        dbName: configService.get('DATABASE_NAME'),
      }),
      inject: [ConfigService],
    }),
    MoviesModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, TmdbService],
})
export class AppModule {}
