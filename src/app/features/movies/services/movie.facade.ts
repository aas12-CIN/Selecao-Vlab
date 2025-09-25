import { Injectable, inject } from '@angular/core';
import { MovieApiService } from '../api/movie.api';
import { MovieStateService } from '../state/movie.state';
import { map, tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Genre, MovieFilters, PersonResponse, PersonDetails, PersonCreditsResponse } from '../types/movie.type';

@Injectable({
  providedIn: 'root'
})
export class MovieFacade {
  private api = inject(MovieApiService);
  private state = inject(MovieStateService);

  movies$ = this.state.movies$;
  genres: Genre[] = [];

  loadPopularMovies(page = 1) {
    this.state.setLoading(true);
    this.api.getPopularMovies(page).pipe(
      tap(response => {
        this.state.setMovies(response.results);
        this.state.setPagination(response.page, response.total_pages);
        this.state.setLoading(false);
      }),
      catchError(err => {
        this.state.setError('Failed to load popular movies.');
        this.state.setLoading(false);
        return of(null);
      })
    ).subscribe();
  }

  searchMovies(query: string, page = 1) {
    this.state.setLoading(true);
    this.api.searchMovies(query, page).pipe(
      tap(response => {
        this.state.setMovies(response.results);
        this.state.setPagination(response.page, response.total_pages);
        this.state.setLoading(false);
      }),
      catchError(err => {
        this.state.setError('Failed to search movies.');
        this.state.setLoading(false);
        return of(null);
      })
    ).subscribe();
  }

  // Load genres
  loadGenres(): Observable<Genre[]> {
    return this.api.getMovieGenres().pipe(
      tap(response => {
        this.genres = response.genres;
      }),
      map(response => response.genres),
      catchError(err => {
        console.error('Failed to load genres:', err);
        return of([]);
      })
    );
  }

  // Search movies with filters
  searchMoviesWithFilters(filters: MovieFilters, page = 1) {
    this.state.setLoading(true);
    
    this.api.searchMoviesWithFilters(filters, page).pipe(
      tap(response => {
        console.log('🎬 Facade - Received response:', response);
        console.log('🎬 Facade - Total movies:', response.results.length);
        
        // Log first few movies to check for duplicates
        const firstFew = response.results.slice(0, 5);
        console.log('🎬 Facade - First 5 movies:', firstFew.map(m => ({
          id: m.id,
          title: m.title,
          year: m.release_date?.substring(0, 4),
          rating: m.vote_average
        })));
        
        // Check for duplicate IDs and remove them
        const movieIds = response.results.map(m => m.id);
        const uniqueIds = [...new Set(movieIds)];
        if (movieIds.length !== uniqueIds.length) {
          console.warn('⚠️ Duplicate movie IDs found!', {
            total: movieIds.length,
            unique: uniqueIds.length,
            duplicates: movieIds.length - uniqueIds.length
          });
          
          // Remove duplicates, keeping the first occurrence
          const uniqueMovies = response.results.filter((movie, index, self) => 
            index === self.findIndex(m => m.id === movie.id)
          );
          
          console.log('✅ Removed duplicates:', {
            before: response.results.length,
            after: uniqueMovies.length
          });
          
          this.state.setMovies(uniqueMovies);
        } else {
          this.state.setMovies(response.results);
        }
        this.state.setPagination(response.page, response.total_pages);
        this.state.setLoading(false);
      }),
      catchError(err => {
        console.error('❌ Facade - Search error:', err);
        this.state.setError('Failed to search movies.');
        this.state.setLoading(false);
        // Even on error, set empty results to trigger no-results message
        this.state.setMovies([]);
        return of(null);
      })
    ).subscribe();
  }

  // Get genres list
  getGenres(): Genre[] {
    return this.genres;
  }

  // Person Search Methods for Theme Generator
  searchPersons(query: string, page = 1): Observable<PersonResponse> {
    return this.api.searchPersons(query, page);
  }

  getPersonDetails(personId: number): Observable<PersonDetails> {
    return this.api.getPersonDetails(personId);
  }

  getPersonMovieCredits(personId: number): Observable<PersonCreditsResponse> {
    return this.api.getPersonMovieCredits(personId);
  }
}
