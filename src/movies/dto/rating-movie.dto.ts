import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class RateMovieDto {
  @ApiProperty()
  @IsInt({ message: 'Movie ID must be an integer' })
  @IsNotEmpty({ message: 'Movie ID is required' })
  movieId: number;

  @ApiProperty()
  @IsInt({ message: 'Rating must be an integer' })
  @IsNotEmpty({ message: 'Rating is required' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @ApiPropertyOptional()
  @IsString({ message: 'Comment must be a string' })
  @IsOptional()
  comment?: string;
}
