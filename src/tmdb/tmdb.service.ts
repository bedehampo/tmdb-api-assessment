import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TmdbService {
  private readonly baseUrl = process.env.TMDB_BASE_URL;
  private readonly apiKey: string;
  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY');
  }

  // Fetch Popular movies
  async fetchPopularMovies(page: number = 1): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/movie/popular`, {
        params: { api_key: this.apiKey, page },
      });
      return response.data.result;
    } catch (error) {
      throw error;
    }
  }
}
