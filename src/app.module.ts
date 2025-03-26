import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/admin`,
        retryAttempts: 10,
        retryDelay: 1000,
        dbName: configService.get('DATABASE_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
