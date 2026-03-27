import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSession, AccountProfile, UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly plannerStorageKey = 'local-event-current-planner-id';
  private readonly accountStorageKey = 'local-event-account-id';

  private readonly usersSubject = new BehaviorSubject<UserProfile[]>([]);
  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  private readonly accountSubject = new BehaviorSubject<AccountProfile | null>(null);

  readonly users$ = this.usersSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly account$ = this.accountSubject.asObservable();

  pingServer(): Observable<{ status: string; app: string; time: string }> {
    return this.http.get<{ status: string; app: string; time: string }>(`${environment.apiUrl}/health`);
  }

  restoreSession(): Observable<AuthSession | null> {
    const accountId = localStorage.getItem(this.accountStorageKey);

    if (!accountId) {
      this.clearState();
      return of(null);
    }

    return this.http.get<AuthSession>(`${this.authUrl}/account/${accountId}`).pipe(
      tap((session) => this.applySession(session))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.authUrl}/login`, payload).pipe(
      tap((session) => this.applySession(session))
    );
  }

  register(payload: { name: string; email: string; password: string }): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.authUrl}/register`, payload).pipe(
      tap((session) => this.applySession(session))
    );
  }

  setCurrentUser(userId: string): void {
    const user = this.usersSubject.value.find((item) => item.id === userId) ?? null;
    this.currentUserSubject.next(user);

    if (user) {
      localStorage.setItem(this.plannerStorageKey, user.id);
    }
  }

  syncFavoriteEvents(favoriteEvents: string[]): void {
    const currentUser = this.currentUserSubject.value;

    if (!currentUser) {
      return;
    }

    const updatedUser: UserProfile = { ...currentUser, favoriteEvents };
    const nextUsers = this.usersSubject.value.map((user) => user.id === currentUser.id ? updatedUser : user);

    this.currentUserSubject.next(updatedUser);
    this.usersSubject.next(nextUsers);
    localStorage.setItem(this.plannerStorageKey, updatedUser.id);
  }

  logout(): void {
    localStorage.removeItem(this.accountStorageKey);
    localStorage.removeItem(this.plannerStorageKey);
    this.clearState();
  }

  get isAuthenticated(): boolean {
    return Boolean(this.accountSubject.value);
  }

  get hasStoredSession(): boolean {
    return Boolean(localStorage.getItem(this.accountStorageKey));
  }

  private applySession(session: AuthSession): void {
    this.accountSubject.next(session.account);
    this.usersSubject.next(session.planners);
    localStorage.setItem(this.accountStorageKey, session.account.id);

    const storedPlannerId = localStorage.getItem(this.plannerStorageKey);
    const matchedPlanner = session.planners.find((planner) => planner.id === storedPlannerId) ?? session.planners[0] ?? null;

    this.currentUserSubject.next(matchedPlanner);

    if (matchedPlanner) {
      localStorage.setItem(this.plannerStorageKey, matchedPlanner.id);
    }
  }

  private clearState(): void {
    this.accountSubject.next(null);
    this.usersSubject.next([]);
    this.currentUserSubject.next(null);
  }
}
