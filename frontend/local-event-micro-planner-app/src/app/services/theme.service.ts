import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'local-event-theme';
  private readonly themeSubject = new BehaviorSubject<ThemeMode>('light');
  readonly theme$ = this.themeSubject.asObservable();

  initializeTheme(): void {
    const storedTheme = (localStorage.getItem(this.storageKey) as ThemeMode | null) ?? 'light';
    this.applyTheme(storedTheme);
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme);
  }

  private applyTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.storageKey, theme);
    document.body.setAttribute('data-theme', theme);
  }
}
