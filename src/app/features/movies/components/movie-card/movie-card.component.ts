import { Component, Input, inject, OnInit } from '@angular/core';
import { Movie, Genre } from '../../types/movie.type';
import { CommonModule } from '@angular/common';
import { MovieFacade } from '../../services/movie.facade';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class MovieCardComponent implements OnInit {
  @Input() movie!: Movie;
  private facade = inject(MovieFacade);
  private genres: Genre[] = [];

  ngOnInit() {
    // Ensure genres are loaded when component initializes
    this.facade.loadGenres().subscribe(genres => {
      this.genres = genres;
      console.log('🎬 MovieCard - Genres loaded in component:', this.genres);
    });
  }

  getPosterUrl(posterPath: string): string {
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  getGenreNames(): string {
    console.log('🎬 MovieCard - Getting genre names for movie:', this.movie?.title);
    console.log('🎬 MovieCard - Genre IDs:', this.movie?.genre_ids);
    console.log('🎬 MovieCard - Available genres:', this.genres);
    
    if (!this.movie.genre_ids || this.movie.genre_ids.length === 0) {
      console.log('🎬 MovieCard - No genre IDs available');
      return 'Gênero não disponível';
    }

    if (this.genres.length === 0) {
      console.log('🎬 MovieCard - Genres not loaded yet');
      return 'Carregando gêneros...';
    }
    
    const genreNames = this.movie.genre_ids
      .map(id => {
        const genre = this.genres.find(g => g.id === id);
        console.log(`🎬 MovieCard - Genre ID ${id} -> ${genre ? genre.name : 'Not found'}`);
        return genre ? genre.name : `Gênero ${id}`;
      })
      .slice(0, 3); // Mostrar apenas os primeiros 3 gêneros

    const result = genreNames.join(', ');
    console.log('🎬 MovieCard - Final genre names:', result);
    return result;
  }
}
