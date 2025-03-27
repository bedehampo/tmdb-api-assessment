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
  async fetchPopularMovies(page: number = 3): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/movie/popular`, {
        params: { api_key: this.apiKey, page },
      });
      //   console.log('Response:', response.data);
      return response.data.results || [];
    } catch (error) {
      throw error;
    }
  }

  // Fetch Genre's
  async fetchGenreList(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/genre/movie/list`, {
        params: { api_key: this.apiKey },
      });
      // console.log("Response", response)
      return response.data.genres || [];
    } catch (error) {
      throw error;
    }
  }
}
