import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventDetailsComponent } from '../../components/event-details/event-details.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { EventItem } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [CommonModule, EventDetailsComponent, LoaderComponent],
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  currentUserId = '';
  event: EventItem | null = null;
  loading = true;

  constructor() {
    combineLatest([this.route.paramMap, this.userService.currentUser$])
      .pipe(
        switchMap(([params, user]) => {
          const eventId = params.get('id');
          this.currentUserId = user?.id ?? '';

          if (!eventId) {
            throw new Error('Event id missing in route.');
          }

          return this.eventService.getEventById(eventId, this.currentUserId);
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (event) => {
          this.event = event;
        },
        error: (error: { error?: { message?: string } }) => {
          this.toastService.error(error.error?.message ?? 'Unable to load this event.');
          this.loading = false;
        }
      });
  }

  toggleBookmark(eventId: string): void {
    if (!this.currentUserId) {
      return;
    }

    this.eventService.toggleBookmark(this.currentUserId, eventId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.userService.syncFavoriteEvents(response.favoriteEvents);
        this.toastService.success(response.message);
        this.reload();
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to update bookmark.');
      }
    });
  }

  updateRsvp(status: 'going' | 'not-going'): void {
    if (!this.event || !this.currentUserId) {
      return;
    }

    this.eventService.respondToRsvp({ userId: this.currentUserId, eventId: this.event.id, status }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.event = response.event;
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to update RSVP.');
      }
    });
  }

  deleteEvent(eventId: string): void {
    if (!this.currentUserId || !window.confirm('Delete this event?')) {
      return;
    }

    this.eventService.deleteEvent(eventId, this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        void this.router.navigate(['/']);
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to delete event.');
      }
    });
  }

  private reload(): void {
    const eventId = this.route.snapshot.paramMap.get('id');

    if (!eventId) {
      return;
    }

    this.eventService.getEventById(eventId, this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event) => {
        this.event = event;
      }
    });
  }
}
