import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (err) =>
            `${err.property} - ${Object.values(err.constraints).join(', ')}`,
        );
        return new BadRequestException(messages);
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TMDB Technical Assessment')
    .setDescription(
      'A RESTful API integrating The Movie Database (TMDB) with NestJS and MongoDB',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(
      `RUNNING API IN MODE: ${process.env.NODE_ENV} on port: ${PORT}`,
    );
  });
}
bootstrap();
