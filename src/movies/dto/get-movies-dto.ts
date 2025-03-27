import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class GetMoviesDto {
  @ApiPropertyOptional({ description: 'Page number (default: 1)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by keyword (in title or overview)',
    example: 'inception',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by genre ID', example: 53 })
  @IsOptional()
  @IsInt()
  genre?: number;

  @ApiPropertyOptional({
    description: 'Filter by release year (YYYY)',
    example: '2025',
  })
  @IsOptional()
  @IsString()
  year?: string;
}
