import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Marathon, MarathonMovie, MarathonState } from '../types/marathon.type';
import { MovieApiService } from '../../movies/api/movie.api';

@Injectable({
  providedIn: 'root'
})
export class MarathonService {
  private readonly STORAGE_KEY = 'movie_marathons';
  private readonly CURRENT_MARATHON_KEY = 'current_marathon';
  
  // Current marathon state
  private currentMarathonSubject = new BehaviorSubject<MarathonMovie[]>([]);
  private isMarathonModeSubject = new BehaviorSubject<boolean>(false);
  
  public currentMarathon$ = this.currentMarathonSubject.asObservable();
  public isMarathonMode$ = this.isMarathonModeSubject.asObservable();

  private movieApi = inject(MovieApiService);

  constructor() {
    // Load current marathon from localStorage on initialization
    this.loadCurrentMarathon();
  }

  // Current Marathon Management
  addMovieToCurrentMarathon(movie: MarathonMovie): void {
    const currentMarathon = this.currentMarathonSubject.value;
    
    // Check if movie already exists
    const existingIndex = currentMarathon.findIndex(m => m.id === movie.id);
    if (existingIndex === -1) {
      // If movie has incomplete data, fetch full details
      if (!movie.runtime || !movie.release_date || movie.genre_ids.length === 0) {
        console.log('🎬 Marathon - Fetching complete movie details for:', movie.title);
        this.movieApi.getMovieDetails(movie.id).subscribe({
          next: (fullMovie) => {
            const completeMovie: MarathonMovie = {
              id: fullMovie.id,
              title: fullMovie.title,
              poster_path: fullMovie.poster_path,
              vote_average: fullMovie.vote_average,
              release_date: fullMovie.release_date,
              genre_ids: fullMovie.genre_ids,
              overview: fullMovie.overview,
              runtime: fullMovie.runtime,
              popularity: fullMovie.popularity,
              addedAt: new Date()
            };
            
            const updatedMarathon = [...currentMarathon, completeMovie];
            this.currentMarathonSubject.next(updatedMarathon);
            this.saveCurrentMarathonToStorage(updatedMarathon);
            
            console.log('🎬 Marathon - Complete movie added:', completeMovie.title, 'Runtime:', completeMovie.runtime);
          },
          error: (error) => {
            console.error('🎬 Marathon - Error fetching movie details:', error);
            // Fallback: add movie with available data
            const movieWithTimestamp: MarathonMovie = {
              ...movie,
              addedAt: new Date()
            };
            
            const updatedMarathon = [...currentMarathon, movieWithTimestamp];
            this.currentMarathonSubject.next(updatedMarathon);
            this.saveCurrentMarathonToStorage(updatedMarathon);
            
            console.log('🎬 Marathon - Movie added with limited data:', movie.title);
          }
        });
      } else {
        // Movie already has complete data
        const movieWithTimestamp: MarathonMovie = {
          ...movie,
          addedAt: new Date()
        };
        
        const updatedMarathon = [...currentMarathon, movieWithTimestamp];
        this.currentMarathonSubject.next(updatedMarathon);
        this.saveCurrentMarathonToStorage(updatedMarathon);
        
        console.log('🎬 Marathon - Complete movie added:', movie.title, 'Runtime:', movie.runtime);
      }
    } else {
      console.log('🎬 Marathon - Movie already exists:', movie.title);
    }
  }

  removeMovieFromCurrentMarathon(movieId: number): void {
    const currentMarathon = this.currentMarathonSubject.value;
    const updatedMarathon = currentMarathon.filter(m => m.id !== movieId);
    
    this.currentMarathonSubject.next(updatedMarathon);
    this.saveCurrentMarathonToStorage(updatedMarathon);
    
    console.log('🎬 Marathon - Movie removed:', movieId);
  }

  clearCurrentMarathon(): void {
    this.currentMarathonSubject.next([]);
    localStorage.removeItem(this.CURRENT_MARATHON_KEY);
    console.log('🎬 Marathon - Current marathon cleared');
  }

  setMarathonMode(isActive: boolean): void {
    this.isMarathonModeSubject.next(isActive);
  }

  getCurrentMarathon(): MarathonMovie[] {
    return this.currentMarathonSubject.value;
  }

  isMarathonMode(): boolean {
    return this.isMarathonModeSubject.value;
  }

  // Saved Marathons Management
  saveMarathon(name: string): string {
    const currentMarathon = this.getCurrentMarathon();
    
    if (currentMarathon.length === 0) {
      throw new Error('Não há filmes na maratona atual para salvar');
    }

    const trimmedName = name.trim();
    
    // Check if a marathon with this name already exists
    const savedMarathons = this.getSavedMarathons();
    const existingMarathon = savedMarathons.find(m => 
      m.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingMarathon) {
      throw new Error(`Já existe uma maratona com o nome "${trimmedName}". Escolha um nome diferente.`);
    }

    const marathon: Marathon = {
      id: this.generateId(),
      name: trimmedName,
      movies: [...currentMarathon],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    savedMarathons.push(marathon);
    
    this.saveMarathonsToStorage(savedMarathons);
    
    // Clear current marathon after saving
    this.clearCurrentMarathon();
    
    console.log('🎬 Marathon - Saved and current marathon cleared:', marathon.name, 'with', marathon.movies.length, 'movies');
    return marathon.id;
  }

  getSavedMarathons(): Marathon[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const marathons = JSON.parse(stored);
      // Convert date strings back to Date objects
      return marathons.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
        movies: m.movies.map((movie: any) => ({
          ...movie,
          addedAt: new Date(movie.addedAt)
        }))
      }));
    } catch (error) {
      console.error('Error loading marathons from localStorage:', error);
      return [];
    }
  }

  loadMarathon(marathonId: string): void {
    const savedMarathons = this.getSavedMarathons();
    const marathon = savedMarathons.find(m => m.id === marathonId);
    
    if (marathon) {
      this.currentMarathonSubject.next(marathon.movies);
      this.saveCurrentMarathonToStorage(marathon.movies);
      console.log('🎬 Marathon - Loaded:', marathon.name);
    } else {
      throw new Error('Maratona não encontrada');
    }
  }

  deleteMarathon(marathonId: string): void {
    const savedMarathons = this.getSavedMarathons();
    const updatedMarathons = savedMarathons.filter(m => m.id !== marathonId);
    
    this.saveMarathonsToStorage(updatedMarathons);
    console.log('🎬 Marathon - Deleted:', marathonId);
  }

  updateMarathon(marathonId: string, name: string, movies?: MarathonMovie[]): void {
    const savedMarathons = this.getSavedMarathons();
    const marathonIndex = savedMarathons.findIndex(m => m.id === marathonId);
    
    if (marathonIndex !== -1) {
      const trimmedName = name.trim();
      
      // Check if name already exists (excluding current marathon)
      const existingMarathon = savedMarathons.find(m => 
        m.id !== marathonId && m.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (existingMarathon) {
        throw new Error(`Já existe uma maratona com o nome "${trimmedName}". Escolha um nome diferente.`);
      }

      savedMarathons[marathonIndex] = {
        ...savedMarathons[marathonIndex],
        name: trimmedName,
        movies: movies ? [...movies] : savedMarathons[marathonIndex].movies,
        updatedAt: new Date()
      };
      
      this.saveMarathonsToStorage(savedMarathons);
      console.log('🎬 Marathon - Updated:', trimmedName, 'Movies:', movies ? movies.length : 'unchanged');
    }
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveMarathonsToStorage(marathons: Marathon[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(marathons));
    } catch (error) {
      console.error('Error saving marathons to localStorage:', error);
      throw new Error('Erro ao salvar maratona. Verifique o espaço disponível.');
    }
  }

  private saveCurrentMarathonToStorage(movies: MarathonMovie[]): void {
    try {
      localStorage.setItem(this.CURRENT_MARATHON_KEY, JSON.stringify(movies));
    } catch (error) {
      console.error('Error saving current marathon to localStorage:', error);
    }
  }

  private loadCurrentMarathon(): void {
    try {
      const stored = localStorage.getItem(this.CURRENT_MARATHON_KEY);
      if (stored) {
        const movies = JSON.parse(stored);
        // Convert date strings back to Date objects
        const moviesWithDates = movies.map((movie: any) => ({
          ...movie,
          addedAt: new Date(movie.addedAt)
        }));
        this.currentMarathonSubject.next(moviesWithDates);
        console.log('🎬 Marathon - Current marathon loaded from storage:', moviesWithDates.length, 'movies');
      }
    } catch (error) {
      console.error('Error loading current marathon from localStorage:', error);
    }
  }
}
