import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarathonService } from '../../services/marathon.service';
import { Marathon, MarathonMovie } from '../../types/marathon.type';

@Component({
  selector: 'app-marathon-management',
  templateUrl: './marathon-management.component.html',
  styleUrls: ['./marathon-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MarathonManagementComponent implements OnInit {
  private marathonService = inject(MarathonService);
  private router = inject(Router);

  savedMarathons: Marathon[] = [];
  currentMarathon: MarathonMovie[] = [];
  isMarathonMode = false;
  showSaveModal = false;
  showDeleteModal = false;
  showEditModal = false;
  marathonToDelete: Marathon | null = null;
  
  newMarathonName = '';
  editingMarathon: Marathon | null = null;
  editMarathonName = '';
  editingMovies: MarathonMovie[] = [];
  sortBy: 'release_date' | 'vote_average' | 'title' | 'runtime' | 'popularity' = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.loadData();
    
    // Subscribe to current marathon changes
    this.marathonService.currentMarathon$.subscribe(marathon => {
      this.currentMarathon = marathon;
    });

    this.marathonService.isMarathonMode$.subscribe(isActive => {
      this.isMarathonMode = isActive;
    });
  }

  private loadData() {
    this.savedMarathons = this.marathonService.getSavedMarathons();
    this.currentMarathon = this.marathonService.getCurrentMarathon();
    this.isMarathonMode = this.marathonService.isMarathonMode();
  }

  // Current Marathon Actions
  toggleMarathonMode() {
    const newMode = !this.isMarathonMode;
    this.marathonService.setMarathonMode(newMode);
    
    if (!newMode) {
      // Clear current marathon when exiting marathon mode
      this.marathonService.clearCurrentMarathon();
    }
  }

  removeFromCurrentMarathon(movieId: number) {
    this.marathonService.removeMovieFromCurrentMarathon(movieId);
  }

  clearCurrentMarathon() {
    if (confirm('Tem certeza que deseja limpar a maratona atual?')) {
      this.marathonService.clearCurrentMarathon();
    }
  }

  // Save Marathon Modal
  openSaveModal() {
    if (this.currentMarathon.length === 0) {
      alert('Adicione pelo menos um filme à maratona antes de salvar.');
      return;
    }
    this.newMarathonName = '';
    this.showSaveModal = true;
  }

  closeSaveModal() {
    this.showSaveModal = false;
    this.newMarathonName = '';
  }

  saveMarathon() {
    if (!this.newMarathonName.trim()) {
      alert('Digite um nome para a maratona.');
      return;
    }

    try {
      const marathonName = this.newMarathonName;
      this.marathonService.saveMarathon(this.newMarathonName);
      this.loadData();
      this.closeSaveModal();
      alert(`Maratona "${marathonName}" salva com sucesso!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar maratona.');
    }
  }

  // Load Marathon
  loadMarathon(marathon: Marathon) {
    if (confirm(`Carregar maratona "${marathon.name}"? Isso substituirá a maratona atual.`)) {
      try {
        this.marathonService.loadMarathon(marathon.id);
        this.loadData();
        alert(`Maratona "${marathon.name}" carregada com sucesso!`);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao carregar maratona.');
      }
    }
  }

  // Edit Marathon
  startEditing(marathon: Marathon) {
    this.editingMarathon = marathon;
    this.editMarathonName = marathon.name;
    this.editingMovies = [...marathon.movies]; // Create a copy for editing
    this.sortBy = 'title'; // Reset to default sort
    this.sortOrder = 'asc';
    this.showEditModal = true;
  }

  cancelEditing() {
    this.editingMarathon = null;
    this.editMarathonName = '';
    this.editingMovies = [];
    this.showEditModal = false;
  }

  saveEdit() {
    if (!this.editMarathonName.trim()) {
      alert('Digite um nome para a maratona.');
      return;
    }

    if (this.editingMarathon) {
      try {
        this.marathonService.updateMarathon(
          this.editingMarathon.id, 
          this.editMarathonName, 
          this.editingMovies
        );
        this.loadData();
        this.cancelEditing();
        alert('Maratona atualizada com sucesso!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao atualizar maratona.');
      }
    }
  }

  // Edit Movies
  removeMovieFromEdit(movieId: number) {
    this.editingMovies = this.editingMovies.filter(m => m.id !== movieId);
  }

  moveMovieUp(index: number) {
    if (index > 0) {
      const temp = this.editingMovies[index];
      this.editingMovies[index] = this.editingMovies[index - 1];
      this.editingMovies[index - 1] = temp;
    }
  }

  moveMovieDown(index: number) {
    if (index < this.editingMovies.length - 1) {
      const temp = this.editingMovies[index];
      this.editingMovies[index] = this.editingMovies[index + 1];
      this.editingMovies[index + 1] = temp;
    }
  }

  // Sorting functionality
  sortMovies() {
    this.editingMovies = [...this.editingMovies].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'release_date':
          valueA = a.release_date ? new Date(a.release_date).getTime() : 0;
          valueB = b.release_date ? new Date(b.release_date).getTime() : 0;
          break;
        case 'vote_average':
          valueA = a.vote_average || 0;
          valueB = b.vote_average || 0;
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'runtime':
          valueA = a.runtime || 0;
          valueB = b.runtime || 0;
          break;
        case 'popularity':
          valueA = a.popularity || 0;
          valueB = b.popularity || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  onSortChange() {
    this.sortMovies();
  }

  getSortByLabel(): string {
    const labels = {
      'release_date': 'Ano de Lançamento',
      'vote_average': 'Nota',
      'title': 'Nome',
      'runtime': 'Duração',
      'popularity': 'Popularidade'
    };
    return labels[this.sortBy];
  }

  // Delete Marathon
  confirmDelete(marathon: Marathon) {
    this.marathonToDelete = marathon;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.marathonToDelete = null;
  }

  deleteMarathon() {
    if (this.marathonToDelete) {
      try {
        const marathonName = this.marathonToDelete.name;
        this.marathonService.deleteMarathon(this.marathonToDelete.id);
        this.loadData();
        this.closeDeleteModal();
        alert(`Maratona "${marathonName}" excluída com sucesso!`);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao excluir maratona.');
      }
    }
  }

  // Utility Methods
  getMarathonDuration(marathon: Marathon): string {
    const totalMinutes = marathon.movies.reduce((sum, movie) => sum + (movie.runtime || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getCurrentMarathonDuration(): string {
    const totalMinutes = this.currentMarathon.reduce((sum, movie) => sum + (movie.runtime || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  goToMovies() {
    this.router.navigate(['/movies']);
  }
}
