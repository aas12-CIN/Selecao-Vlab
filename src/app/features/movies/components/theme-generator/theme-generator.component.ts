import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieFacade } from '../../services/movie.facade';
import { MarathonService } from '../../../marathons/services/marathon.service';
import { Person, PersonDetails, PersonCreditsResponse, PersonMovieCredit } from '../../types/movie.type';

@Component({
  selector: 'app-theme-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-generator.component.html',
  styleUrls: ['./theme-generator.component.scss']
})
export class ThemeGeneratorComponent implements OnInit {
  searchQuery: string = '';
  searchResults: Person[] = [];
  selectedPerson: PersonDetails | null = null;
  personFilmography: PersonMovieCredit[] = [];
  isLoading = false;
  isSearchMode = false;
  hasSearched = false;
  errorMessage = '';

  // Current marathon state
  currentMarathon$: any;
  isMarathonMode$: any;

  constructor(
    private movieFacade: MovieFacade,
    private marathonService: MarathonService
  ) {
    // Initialize observables in constructor to avoid initialization error
    this.currentMarathon$ = this.marathonService.currentMarathon$;
    this.isMarathonMode$ = this.marathonService.isMarathonMode$;
  }

  ngOnInit(): void {
    // Subscribe to marathon mode changes
    this.isMarathonMode$.subscribe((isMarathonMode: boolean) => {
      if (!isMarathonMode) {
        this.resetSearch();
      }
    });
  }

  searchPersons(): void {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Digite um nome para buscar.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.isSearchMode = true;
    this.hasSearched = true;

    this.movieFacade.searchPersons(this.searchQuery.trim()).subscribe({
      next: (response) => {
        this.searchResults = response.results;
        this.isLoading = false;
        
        if (this.searchResults.length === 0) {
          this.errorMessage = 'Nenhuma pessoa encontrada. Tente outro nome.';
        }
      },
      error: (error) => {
        console.error('Error searching persons:', error);
        this.errorMessage = 'Erro ao buscar pessoas. Tente novamente.';
        this.isLoading = false;
        this.searchResults = [];
      }
    });
  }

  selectPerson(person: Person): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get person details and filmography
    this.movieFacade.getPersonDetails(person.id).subscribe({
      next: (details) => {
        this.selectedPerson = details;
        this.loadPersonFilmography(person.id);
      },
      error: (error) => {
        console.error('Error loading person details:', error);
        this.errorMessage = 'Erro ao carregar detalhes da pessoa.';
        this.isLoading = false;
      }
    });
  }

  private loadPersonFilmography(personId: number): void {
    this.movieFacade.getPersonMovieCredits(personId).subscribe({
      next: (credits) => {
        // Combine cast and crew, remove duplicates by movie ID
        const allMovies = [...credits.cast, ...credits.crew];
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        );

        // Sort by release date (most recent first)
        this.personFilmography = uniqueMovies.sort((a, b) => {
          const dateA = new Date(a.release_date || '1900-01-01');
          const dateB = new Date(b.release_date || '1900-01-01');
          return dateB.getTime() - dateA.getTime();
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading filmography:', error);
        this.errorMessage = 'Erro ao carregar filmografia.';
        this.isLoading = false;
        this.personFilmography = [];
      }
    });
  }

  addMovieToMarathon(movie: PersonMovieCredit): void {
    // Check if marathon mode is active
    this.isMarathonMode$.subscribe((isMarathonMode: boolean) => {
      if (!isMarathonMode) {
        alert('Ative o "Modo Maratona" na página de Maratonas para adicionar filmes.');
        return;
      }

      // Convert PersonMovieCredit to MarathonMovie
      const marathonMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
        runtime: movie.runtime,
        popularity: movie.popularity,
        addedAt: new Date()
      };

      this.marathonService.addMovieToCurrentMarathon(marathonMovie);
      
      // Visual feedback
      const button = event?.target as HTMLElement;
      if (button) {
        button.textContent = '✓ Adicionado';
        button.style.background = '#10b981';
        setTimeout(() => {
          button.textContent = 'Adicionar';
          button.style.background = '';
        }, 2000);
      }
    }).unsubscribe(); // Unsubscribe immediately since we only need the current value
  }

  goBackToSearch(): void {
    this.selectedPerson = null;
    this.personFilmography = [];
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedPerson = null;
    this.personFilmography = [];
    this.isSearchMode = false;
    this.hasSearched = false;
    this.errorMessage = '';
    this.isLoading = false;
  }

  getPosterUrl(posterPath: string): string {
    if (!posterPath) {
      return 'https://via.placeholder.com/300x450?text=No+Image';
    }
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  getProfileUrl(profilePath: string): string {
    if (!profilePath) {
      return 'https://via.placeholder.com/300x450?text=No+Image';
    }
    return `https://image.tmdb.org/t/p/w500${profilePath}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getDepartmentLabel(department: string): string {
    const labels: { [key: string]: string } = {
      'Acting': 'Ator/Atriz',
      'Directing': 'Diretor(a)',
      'Writing': 'Roteirista',
      'Production': 'Produtor(a)',
      'Camera': 'Câmera',
      'Sound': 'Som',
      'Art': 'Arte',
      'Editing': 'Edição',
      'Costume & Make-Up': 'Figurino e Maquiagem',
      'Crew': 'Equipe',
      'Lighting': 'Iluminação',
      'Visual Effects': 'Efeitos Visuais',
      'Music': 'Música',
      'Actors': 'Ator/Atriz',
      'Directors': 'Diretor(a)',
      'Writers': 'Roteirista',
      'Producers': 'Produtor(a)',
      'Cinematography': 'Cinematografia',
      'Costume Design': 'Figurino',
      'Makeup': 'Maquiagem',
      'Set Decoration': 'Decoração',
      'Visual Effects Supervisor': 'Supervisor de Efeitos Visuais',
      'Composer': 'Compositor(a)',
      'Editor': 'Editor(a)',
      'Executive Producer': 'Produtor(a) Executivo(a)',
      'Co-Producer': 'Co-Produtor(a)',
      'Associate Producer': 'Produtor(a) Associado(a)',
      'Line Producer': 'Produtor(a) de Linha',
      'Supervising Producer': 'Produtor(a) Supervisor(a)'
    };
    return labels[department] || department;
  }

  getJobLabel(job: string): string {
    const labels: { [key: string]: string } = {
      'Director': 'Diretor(a)',
      'Writer': 'Roteirista',
      'Screenplay': 'Roteiro',
      'Story': 'História',
      'Producer': 'Produtor(a)',
      'Executive Producer': 'Produtor(a) Executivo(a)',
      'Co-Producer': 'Co-Produtor(a)',
      'Associate Producer': 'Produtor(a) Associado(a)',
      'Cinematography': 'Cinematografia',
      'Director of Photography': 'Diretor(a) de Fotografia',
      'Editor': 'Editor(a)',
      'Film Editor': 'Editor(a) de Filme',
      'Music': 'Música',
      'Original Music Composer': 'Compositor(a) de Música Original',
      'Composer': 'Compositor(a)',
      'Costume Design': 'Figurino',
      'Costume Designer': 'Figurinista',
      'Production Design': 'Direção de Arte',
      'Art Direction': 'Direção de Arte',
      'Set Decoration': 'Decoração',
      'Makeup Artist': 'Maquiador(a)',
      'Hair Stylist': 'Cabeleireiro(a)',
      'Sound': 'Som',
      'Sound Designer': 'Designer de Som',
      'Sound Editor': 'Editor(a) de Som',
      'Sound Mixer': 'Mixador(a) de Som',
      'Visual Effects': 'Efeitos Visuais',
      'Visual Effects Supervisor': 'Supervisor(a) de Efeitos Visuais',
      'Special Effects': 'Efeitos Especiais',
      'Stunt Coordinator': 'Coordenador(a) de Dublês',
      'Casting': 'Elenco',
      'Casting Director': 'Diretor(a) de Elenco',
      'Assistant Director': 'Assistente de Direção',
      'First Assistant Director': 'Primeiro(a) Assistente de Direção',
      'Second Assistant Director': 'Segundo(a) Assistente de Direção',
      'Script Supervisor': 'Supervisor(a) de Roteiro',
      'Continuity': 'Continuité',
      'Location Manager': 'Gerente de Locação',
      'Unit Production Manager': 'Gerente de Produção',
      'Production Manager': 'Gerente de Produção',
      'Production Coordinator': 'Coordenador(a) de Produção',
      'Executive In Charge Of Production': 'Executivo(a) Responsável pela Produção'
    };
    return labels[job] || job;
  }


}
