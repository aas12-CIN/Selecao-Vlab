export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime: number;
  popularity: number;
  genres?: Genre[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieFilters {
  query?: string;
  genre?: number;
  year?: number;
  sortBy?: 'release_date' | 'vote_average' | 'title' | 'runtime' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface GenreResponse {
  genres: Genre[];
}

// Person and Filmography types for Theme Generator
export interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department: string;
  popularity: number;
  adult: boolean;
  gender: number;
}

export interface PersonResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

export interface PersonDetails extends Person {
  biography: string;
  birthday: string;
  deathday: string;
  place_of_birth: string;
  also_known_as: string[];
  imdb_id: string;
}

export interface PersonMovieCredit {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime: number;
  popularity: number;
  character?: string; // For actors
  job?: string; // For crew members
  department?: string; // For crew members
}

export interface PersonCreditsResponse {
  cast: PersonMovieCredit[];
  crew: PersonMovieCredit[];
}
