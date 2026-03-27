import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventFormComponent } from '../../components/event-form/event-form.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { EventFormPayload, EventItem, SuggestionResponse } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-event-editor-page',
  standalone: true,
  imports: [CommonModule, EventFormComponent, LoaderComponent],
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.css']
})
export class EventEditorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  currentUserId = '';
  event: EventItem | null = null;
  suggestions: SuggestionResponse | null = null;
  loading = false;
  isEditMode = false;

  constructor() {
    combineLatest([this.route.paramMap, this.userService.currentUser$])
      .pipe(
        switchMap(([params, user]) => {
          this.currentUserId = user?.id ?? '';
          const eventId = params.get('id');
          this.isEditMode = Boolean(eventId);
          this.loading = this.isEditMode;

          if (!eventId) {
            this.event = null;
            this.loadSuggestions('Pune');
            return of(null);
          }

          return this.eventService.getEventById(eventId, this.currentUserId).pipe(
            switchMap((event) => {
              this.event = event;
              this.loading = false;
              this.loadSuggestions(event.city || 'Pune');
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {},
        error: (error: { error?: { message?: string } }) => {
          this.toastService.error(error.error?.message ?? 'Unable to load the event editor.');
          this.loading = false;
        }
      });
  }

  saveEvent(payload: EventFormPayload): void {
    if (!this.currentUserId) {
      this.toastService.error('Select a planner profile before saving an event.');
      return;
    }

    const request$ = this.event
      ? this.eventService.updateEvent(this.event.id, { ...payload, updatedBy: this.currentUserId })
      : this.eventService.createEvent({ ...payload, createdBy: this.currentUserId });

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event) => {
        this.toastService.success(this.event ? 'Event updated successfully.' : 'Event created successfully.');
        void this.router.navigate(['/events', event.id]);
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to save the event.');
      }
    });
  }

  updateSuggestions(city: string): void {
    this.loadSuggestions(city);
  }

  cancel(): void {
    if (this.event) {
      void this.router.navigate(['/events', this.event.id]);
      return;
    }

    void this.router.navigate(['/']);
  }

  private loadSuggestions(city: string): void {
    this.eventService.getSuggestions(city).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (suggestions) => {
        this.suggestions = suggestions;
      }
    });
  }
}
