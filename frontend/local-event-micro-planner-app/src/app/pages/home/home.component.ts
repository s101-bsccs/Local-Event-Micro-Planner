import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { EventListComponent } from '../../components/event-list/event-list.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { SearchComponent } from '../../components/search/search.component';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import { EventFilters, EventItem, SuggestionResponse } from '../../models/event.model';
import { AccountProfile, UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SearchComponent, FilterComponent, EventListComponent, LoaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  filters: EventFilters = {
    category: '',
    city: '',
    date: '',
    status: '',
    search: ''
  };

  currentUser: UserProfile | null = null;
  account: AccountProfile | null = null;
  events: EventItem[] = [];
  categories: string[] = [];
  cities: string[] = [];
  suggestions: SuggestionResponse | null = null;
  totalEvents = 0;
  totalRsvps = 0;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.userService.account$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((account) => {
      this.account = account;
    });

    this.userService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadFeed();
      }
    });
  }

  onSearchChange(search: string): void {
    this.filters = { ...this.filters, search };
    this.loadFeed();
  }

  onFiltersChange(filters: EventFilters): void {
    this.filters = { ...filters };
    this.loadFeed();
  }

  toggleBookmark(eventId: string): void {
    if (!this.currentUser) {
      return;
    }

    this.eventService.toggleBookmark(this.currentUser.id, eventId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.userService.syncFavoriteEvents(response.favoriteEvents);
        this.toastService.success(response.message);
        this.loadFeed();
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to update bookmark.');
      }
    });
  }

  deleteEvent(eventId: string): void {
    if (!this.currentUser || !window.confirm('Delete this event?')) {
      return;
    }

    this.eventService.deleteEvent(eventId, this.currentUser.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadFeed();
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to delete event.');
      }
    });
  }

  private loadFeed(): void {
    this.loading = true;
    this.errorMessage = '';

    this.eventService.getEvents(this.filters, this.currentUser?.id)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.events = response.events;
          this.categories = response.filters.categories;
          this.cities = response.filters.cities;
          this.suggestions = response.suggestions;
          this.totalEvents = response.analytics.totalEvents;
          this.totalRsvps = response.analytics.totalRsvps;
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage = error.error?.message ?? 'Unable to load the event feed right now.';
        }
      });
  }
}
