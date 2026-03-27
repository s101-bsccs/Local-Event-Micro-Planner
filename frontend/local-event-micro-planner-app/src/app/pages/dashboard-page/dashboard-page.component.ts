import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DashboardResponse } from '../../models/dashboard.model';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardComponent, LoaderComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent {
  private readonly eventService = inject(EventService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  dashboard: DashboardResponse | null = null;
  currentUserId = '';
  loading = true;

  constructor() {
    this.userService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUserId = user?.id ?? '';

      if (!this.currentUserId) {
        this.loading = false;
        return;
      }

      this.fetchDashboard();
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
        this.fetchDashboard();
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to update bookmark.');
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
        this.fetchDashboard();
      },
      error: (error: { error?: { message?: string } }) => {
        this.toastService.error(error.error?.message ?? 'Unable to delete event.');
      }
    });
  }

  private fetchDashboard(): void {
    this.loading = true;

    this.eventService.getDashboard(this.currentUserId)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
        },
        error: (error: { error?: { message?: string } }) => {
          this.toastService.error(error.error?.message ?? 'Unable to load dashboard data.');
        }
      });
  }
}
