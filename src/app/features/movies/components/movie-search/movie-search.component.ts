import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieFacade } from '../../services/movie.facade';
import { MovieFilters, Genre } from '../../types/movie.type';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-movie-search',
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class MovieSearchComponent implements OnInit {
  facade = inject(MovieFacade);
  fb = inject(FormBuilder);

  searchForm: FormGroup;
  genres: Genre[] = [];
  isSearchMode = false;

  @Output() searchModeChanged = new EventEmitter<boolean>();


  constructor() {
    this.searchForm = this.fb.group({
      query: [''],
      genre: [''],
      year: ['']
    });
  }

  ngOnInit() {
    // Load genres
    this.facade.loadGenres().subscribe(genres => {
      this.genres = genres;
    });

    // Watch for form changes and trigger search
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.performSearch();
    });
  }

  toggleSearchMode() {
    this.isSearchMode = !this.isSearchMode;
    this.searchModeChanged.emit(this.isSearchMode);
    
    if (!this.isSearchMode) {
      this.clearSearch();
    }
  }

  performSearch() {
    if (this.isSearchMode) {
      const rawFilters = this.searchForm.value;
      
      console.log('🔍 Raw form values:', rawFilters);
      console.log('🔍 Year value type:', typeof rawFilters.year, 'Year value:', rawFilters.year);
      
      // Convert and clean filters
      const filters: MovieFilters = {};
      
      if (rawFilters.query && rawFilters.query.trim()) {
        filters.query = rawFilters.query.trim();
      }
      
      if (rawFilters.genre && rawFilters.genre !== '') {
        filters.genre = Number(rawFilters.genre);
      }
      
      if (rawFilters.year && !isNaN(Number(rawFilters.year))) {
        filters.year = Number(rawFilters.year);
      }
      
      console.log('🎯 Processed filters:', filters);
      
      // Always perform search when in search mode, even with empty filters
      this.facade.searchMoviesWithFilters(filters);
    }
  }

  clearSearch() {
    this.searchForm.reset({
      query: '',
      genre: '',
      year: ''
    });
    this.facade.loadPopularMovies();
  }

  getGenreName(genreId: number): string {
    const genre = this.genres.find(g => g.id === genreId);
    return genre ? genre.name : '';
  }
}
