import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MovieResponse, GenreResponse, MovieFilters, Movie, PersonResponse, PersonDetails, PersonCreditsResponse } from '../types/movie.type';

@Injectable({
  providedIn: 'root'
})
export class MovieApiService {
  private http = inject(HttpClient);
  private readonly apiKey = process.env["NG_APP_API_KEY"] || '';
  private readonly apiUrl = 'https://api.themoviedb.org/3';

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('API Key não configurada. Configure NG_APP_API_KEY no arquivo .env');
    }
  }

  getPopularMovies(page = 1): Observable<MovieResponse> {
    this.validateApiKey();
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`);
  }

  searchMovies(query: string, page = 1): Observable<MovieResponse> {
    this.validateApiKey();
    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie?api_key=${this.apiKey}&query=${query}&page=${page}`);
  }

  // Get all available genres
  getMovieGenres(): Observable<GenreResponse> {
    this.validateApiKey();
    return this.http.get<GenreResponse>(`${this.apiUrl}/genre/movie/list?api_key=${this.apiKey}`);
  }

  // Helper method to check if genre is valid
  private isValidGenre(genre: any): boolean {
    if (genre === undefined || genre === null || genre === '') {
      return false;
    }
    const genreNum = Number(genre);
    return !isNaN(genreNum) && genreNum > 0;
  }

  // Discover movies with filters
  discoverMovies(filters: MovieFilters, page = 1): Observable<MovieResponse> {
    this.validateApiKey();
    let params = new HttpParams().set('api_key', this.apiKey).set('page', page.toString());
    
    console.log('🎬 Discover - Starting with filters:', filters);
    
    // Check if genre is valid
    if (this.isValidGenre(filters.genre)) {
      params = params.set('with_genres', Number(filters.genre).toString());
      console.log('🎬 Discover - Added genre filter:', Number(filters.genre));
    }
    
    if (filters.year) {
      params = params.set('year', filters.year.toString());
      console.log('🎬 Discover - Added year filter:', filters.year);
    }
    
    const finalUrl = `${this.apiUrl}/discover/movie`;
    console.log('🎬 Discover - Final URL:', finalUrl);
    console.log('🎬 Discover - Final params:', params.toString());
    
    return this.http.get<MovieResponse>(finalUrl, { params }).pipe(
      tap(response => {
        console.log('🎬 Discover API - Raw response:', response);
        if (response.results.length > 0) {
          console.log('🎬 Discover API - First movie sample:', {
            id: response.results[0].id,
            title: response.results[0].title,
            year: response.results[0].release_date?.substring(0, 4),
            rating: response.results[0].vote_average
          });
        }
      })
    );
  }

  // Search movies by text query
  searchMoviesByQuery(query: string, year?: number, page = 1): Observable<MovieResponse> {
    this.validateApiKey();
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query.trim())
      .set('page', page.toString());
    
    console.log('🔍 Search - Starting with query:', query, 'year:', year);
    
    // Note: The Movie DB search API doesn't reliably filter by year
    // We'll apply year filter on the frontend instead
    // if (year) {
    //   params = params.set('year', year.toString());
    //   console.log('🔍 Search - Added year filter:', year);
    // }
    
    const finalUrl = `${this.apiUrl}/search/movie`;
    console.log('🔍 Search - Final URL:', finalUrl);
    console.log('🔍 Search - Final params:', params.toString());
    
    return this.http.get<MovieResponse>(finalUrl, { params }).pipe(
      map(response => {
        // Apply year filter on frontend if specified
        if (year) {
          const filteredResults = response.results.filter(movie => {
            const movieYear = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0;
            return movieYear === year;
          });
          
          console.log('🔍 Search - Applied year filter on frontend:', {
            originalCount: response.results.length,
            filteredCount: filteredResults.length,
            targetYear: year
          });
          
          return {
            ...response,
            results: filteredResults
          };
        }
        
        return response;
      }),
      tap(response => {
        console.log('🔍 Search API - Final response:', response);
        if (response.results.length > 0) {
          console.log('🔍 Search API - First movie sample:', {
            id: response.results[0].id,
            title: response.results[0].title,
            year: response.results[0].release_date?.substring(0, 4),
            rating: response.results[0].vote_average
          });
        }
      })
    );
  }

  // Get movie details (for runtime and other details)
  getMovieDetails(id: number): Observable<Movie> {
    this.validateApiKey();
    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}?api_key=${this.apiKey}`);
  }

  // Search movies with filters (combined approach)
  searchMoviesWithFilters(filters: MovieFilters, page = 1): Observable<MovieResponse> {
    console.log('🚀 API - Received filters:', filters);
    
    const hasQuery = filters.query && filters.query.trim();
    const hasGenre = this.isValidGenre(filters.genre);
    
    console.log('🔍 API - hasQuery:', hasQuery, 'hasGenre:', hasGenre);
    console.log('🔍 API - query value:', filters.query, 'genre value:', filters.genre, 'genre type:', typeof filters.genre);

    if (hasQuery && hasGenre) {
      console.log('🎯 API - Using combined search (text + genre filter)');
      // Both query and genre: search by text, then filter by genre on frontend
      return this.searchMoviesByQuery(filters.query!, filters.year, page).pipe(
        map(response => {
          console.log('📊 API - Before genre filter:', response.results.length, 'movies');
          const filteredResults = response.results.filter(movie => 
            movie.genre_ids.includes(Number(filters.genre!))
          );
          console.log('📊 API - After genre filter:', filteredResults.length, 'movies');
          return {
            ...response,
            results: filteredResults
          };
        })
      );
    } else if (hasQuery) {
      console.log('🎯 API - Using text search only');
      // Only query (no genre or "all genres"): use search endpoint
      return this.searchMoviesByQuery(filters.query!, filters.year, page);
    } else {
      console.log('🎯 API - Using discover endpoint');
      // Only genre/year or no filters: use discover endpoint
      return this.discoverMovies(filters, page);
    }
  }

  // Person Search Methods for Theme Generator
  searchPersons(query: string, page = 1): Observable<PersonResponse> {
    this.validateApiKey();
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());
    
    console.log('🔍 Person Search - Query:', query, 'Page:', page);
    return this.http.get<PersonResponse>(`${this.apiUrl}/search/person`, { params });
  }

  getPersonDetails(personId: number): Observable<PersonDetails> {
    this.validateApiKey();
    console.log('👤 Person Details - ID:', personId);
    return this.http.get<PersonDetails>(`${this.apiUrl}/person/${personId}?api_key=${this.apiKey}`);
  }

  getPersonMovieCredits(personId: number): Observable<PersonCreditsResponse> {
    this.validateApiKey();
    console.log('🎬 Person Credits - ID:', personId);
    return this.http.get<PersonCreditsResponse>(`${this.apiUrl}/person/${personId}/movie_credits?api_key=${this.apiKey}`);
  }
}
