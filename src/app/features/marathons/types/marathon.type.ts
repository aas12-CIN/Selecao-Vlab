export interface Marathon {
  id: string;
  name: string;
  movies: MarathonMovie[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MarathonMovie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  overview: string;
  runtime: number;
  popularity: number;
  addedAt: Date;
}

export interface MarathonState {
  currentMarathon: MarathonMovie[];
  isMarathonMode: boolean;
}

export interface SaveMarathonRequest {
  name: string;
  movies: MarathonMovie[];
}
