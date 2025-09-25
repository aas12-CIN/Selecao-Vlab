import { Component, OnInit, inject } from '@angular/core';
import { MovieFacade } from '../../services/movie.facade';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { CarouselComponent, CarouselItem } from '@shared/components/carousel/carousel.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieSearchComponent } from '../../components/movie-search/movie-search.component';
import { ThemeGeneratorComponent } from '../../components/theme-generator/theme-generator.component';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  standalone: true,
  imports: [CommonModule, AsyncPipe, MovieCardComponent, ReactiveFormsModule, CarouselComponent, MovieSearchComponent, ThemeGeneratorComponent]
})
export class MovieListComponent implements OnInit {
  facade = inject(MovieFacade);
  route = inject(ActivatedRoute);
  router = inject(Router);
  searchControl = new FormControl('');

  popularMovies: CarouselItem[] = [];
  topRatedMovies: CarouselItem[] = [];
  upcomingMovies: CarouselItem[] = [];
  nowPlayingMovies: CarouselItem[] = [];
  searchResults: CarouselItem[] = [];
  currentCategory = '';
  isSearchMode = false;
  hasSearched = false;
  isGeneratorMode = false;

  ngOnInit() {
    // Load genres first
    this.facade.loadGenres().subscribe(genres => {
      console.log('🎬 MovieList - Genres loaded:', genres);
    });

    // Detect current category from route
    this.route.url.subscribe(url => {
      if (url.length > 0) {
        this.currentCategory = url[0].path;
      } else {
        this.currentCategory = '';
      }
      this.loadMovieCategories();
    });

    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query) {
        this.facade.searchMovies(query);
      } else {
        this.loadCurrentCategoryMovies();
      }
    });
  }

  private loadMovieCategories() {
    // Load movies based on current category
    this.loadCurrentCategoryMovies();

    // Subscribe to movie state changes
    this.facade.movies$.subscribe(state => {
      const movies = state.movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        imgSrc: movie.poster_path,
        link: `/movie/${movie.id}`,
        rating: (movie.vote_average / 10) * 100, // Convert to percentage for star rating
        vote: movie.vote_average,
        genre: this.getMovieGenres(movie.genre_ids)
      }));

      if (this.isSearchMode) {
        // Store search results separately (even if empty)
        this.searchResults = movies;
        this.hasSearched = true;
      } else {
        // For popular movies categories
        this.popularMovies = movies;
        this.topRatedMovies = movies.slice(0, 10);
        this.upcomingMovies = movies.slice(10, 20);
        this.nowPlayingMovies = movies.slice(20, 30);
      }
    });
  }

  private loadCurrentCategoryMovies() {
    // Load movies based on current route
    switch (this.currentCategory) {
      case 'popular':
      case '':
        this.facade.loadPopularMovies();
        break;
      case 'top-rated':
        // For now, load popular movies. In a real app, you'd have a separate API call
        this.facade.loadPopularMovies();
        break;
      case 'upcoming':
        // For now, load popular movies. In a real app, you'd have a separate API call
        this.facade.loadPopularMovies();
        break;
      case 'now-playing':
        // For now, load popular movies. In a real app, you'd have a separate API call
        this.facade.loadPopularMovies();
        break;
      default:
        this.facade.loadPopularMovies();
    }
  }

  getCategoryTitle(): string {
    switch (this.currentCategory) {
      case 'popular':
        return 'Popular Movies';
      case 'top-rated':
        return 'Top Rated Movies';
      case 'upcoming':
        return 'Upcoming Movies';
      case 'now-playing':
        return 'Now Playing Movies';
      default:
        return 'Movies';
    }
  }

  getCurrentCategoryMovies(): CarouselItem[] {
    switch (this.currentCategory) {
      case 'popular':
        return this.popularMovies;
      case 'top-rated':
        return this.topRatedMovies;
      case 'upcoming':
        return this.upcomingMovies;
      case 'now-playing':
        return this.nowPlayingMovies;
      default:
        return this.popularMovies;
    }
  }

  // Methods to control search mode
  setSearchMode(isSearch: boolean) {
    this.isSearchMode = isSearch;
    if (!isSearch) {
      this.searchResults = [];
      this.hasSearched = false;
      this.loadCurrentCategoryMovies();
    } else {
      // When entering search mode, hide generator and mark as searched
      this.isGeneratorMode = false;
      this.hasSearched = true;
    }
  }

  getSearchResults(): CarouselItem[] {
    return this.searchResults;
  }

  private getMovieGenres(genreIds: number[]): string {
    if (!genreIds || genreIds.length === 0) {
      return 'Gênero não disponível';
    }

    const genres = this.facade.getGenres();
    if (genres.length === 0) {
      return 'Carregando gêneros...';
    }

    const genreNames = genreIds
      .map(id => {
        const genre = genres.find(g => g.id === id);
        return genre ? genre.name : `Gênero ${id}`;
      })
      .slice(0, 2); // Mostrar apenas os primeiros 2 gêneros no carousel

    return genreNames.join(', ');
  }

  setGeneratorMode(isGenerator: boolean) {
    this.isGeneratorMode = isGenerator;
    if (isGenerator) {
      // Clear search mode when entering generator mode
      this.isSearchMode = false;
      this.searchResults = [];
      this.hasSearched = false;
    }
  }
}
