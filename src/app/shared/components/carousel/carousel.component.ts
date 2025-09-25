import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarathonService } from '../../../features/marathons/services/marathon.service';
import { MarathonMovie } from '../../../features/marathons/types/marathon.type';

export interface CarouselItem {
  id: number;
  title?: string;
  name?: string;
  imgSrc?: string;
  link: string;
  rating?: number;
  vote?: number;
  character?: string;
  genre?: string;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CarouselComponent implements AfterViewInit {
  @Input() title!: string;
  @Input() items: CarouselItem[] = [];
  @Input() isExplore = false;
  @Input() exploreLink = '';
  @Input() isDefaultCarousel = true;
  @Input() isCastCarousel = false;

  // Internal navigation state
  canNavigateLeft = false;
  canNavigateRight = false;

  @Output() prevSlideEvent = new EventEmitter<void>();
  @Output() nextSlideEvent = new EventEmitter<void>();

  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  private marathonService = inject(MarathonService);

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.updateNavigation();
    });
  }

  prevSlide() {
    if (this.canNavigateLeft) {
      this.carouselContainer.nativeElement.scrollLeft -= 300;
      setTimeout(() => {
        this.updateNavigation();
      });
      this.prevSlideEvent.emit();
    }
  }

  nextSlide() {
    if (this.canNavigateRight) {
      this.carouselContainer.nativeElement.scrollLeft += 300;
      setTimeout(() => {
        this.updateNavigation();
      });
      this.nextSlideEvent.emit();
    }
  }

  private updateNavigation() {
    if (!this.carouselContainer) return;
    
    const container = this.carouselContainer.nativeElement;
    this.canNavigateLeft = container.scrollLeft > 0;
    this.canNavigateRight = container.scrollLeft < container.scrollWidth - container.clientWidth;
  }

  getPosterUrl(imgSrc: string): string {
    return `https://image.tmdb.org/t/p/w500${imgSrc}`;
  }

  addToMarathon(event: Event, item: CarouselItem) {
    event.preventDefault();
    event.stopPropagation();

    // Check if marathon mode is active
    if (!this.marathonService.isMarathonMode()) {
      alert('Ative o "Modo Maratona" na página de Maratonas para adicionar filmes.');
      return;
    }

    // Convert CarouselItem to MarathonMovie
    const marathonMovie: MarathonMovie = {
      id: item.id,
      title: item.title || item.name || 'Título não disponível',
      poster_path: item.imgSrc || '',
      vote_average: item.vote || 0,
      release_date: '', // We don't have this in CarouselItem
      genre_ids: [], // We don't have this in CarouselItem
      overview: '', // We don't have this in CarouselItem
      runtime: 0, // We don't have this in CarouselItem
      popularity: 0, // We don't have this in CarouselItem
      addedAt: new Date()
    };

    this.marathonService.addMovieToCurrentMarathon(marathonMovie);
    
    // Show success feedback
    const button = event.target as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>Adicionado!';
    button.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
    }, 2000);
  }
}
