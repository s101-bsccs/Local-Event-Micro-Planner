import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardResponse } from '../models/dashboard.model';
import { EventFeedResponse, EventFilters, EventFormPayload, EventItem, SuggestionResponse } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/events`;
  private readonly userUrl = `${environment.apiUrl}/users`;
  private readonly rsvpUrl = `${environment.apiUrl}/rsvp`;

  getEvents(filters: EventFilters, userId?: string): Observable<EventFeedResponse> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<EventFeedResponse>(this.apiUrl, { params });
  }

  getEventById(eventId: string, userId?: string): Observable<EventItem> {
    let params = new HttpParams();

    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<EventItem>(`${this.apiUrl}/${eventId}`, { params });
  }

  createEvent(payload: EventFormPayload & { createdBy: string }): Observable<EventItem> {
    return this.http.post<EventItem>(this.apiUrl, payload);
  }

  updateEvent(eventId: string, payload: EventFormPayload & { updatedBy: string }): Observable<EventItem> {
    return this.http.put<EventItem>(`${this.apiUrl}/${eventId}`, payload);
  }

  deleteEvent(eventId: string, userId: string): Observable<{ message: string }> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${eventId}`, { params });
  }

  respondToRsvp(payload: { userId: string; eventId: string; status: 'going' | 'not-going' }): Observable<{ message: string; event: EventItem }> {
    return this.http.post<{ message: string; event: EventItem }>(this.rsvpUrl, payload);
  }

  getSuggestions(city: string): Observable<SuggestionResponse> {
    const params = city ? new HttpParams().set('city', city) : undefined;
    return this.http.get<SuggestionResponse>(`${this.apiUrl}/meta/suggestions`, { params });
  }

  getDashboard(userId: string): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.userUrl}/${userId}/dashboard`);
  }

  toggleBookmark(userId: string, eventId: string): Observable<{ message: string; favoriteEvents: string[] }> {
    return this.http.patch<{ message: string; favoriteEvents: string[] }>(`${this.userUrl}/${userId}/bookmarks/${eventId}`, {});
  }
}
