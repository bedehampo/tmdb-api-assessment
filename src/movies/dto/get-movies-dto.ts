import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class GetMoviesDto {
  @ApiPropertyOptional({ description: 'Page number (default: 1)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Type(() => Number)
  limit: number = 10;

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
  @Type(() => Number)
  genre?: number;

  @ApiPropertyOptional({
    description: 'Filter by release year (YYYY)',
    example: '2025',
  })
  @IsOptional()
  @IsString()
  year?: string;

  constructor(partial: Partial<GetMoviesDto>) {
    Object.assign(this, partial);
    // Manually parse integers if necessary
    this.page = this.page ? parseInt(this.page as any, 10) : 1;
    this.limit = this.limit ? parseInt(this.limit as any, 10) : 10;
    this.genre = this.genre ? parseInt(this.genre as any, 10) : undefined;
  }
}
