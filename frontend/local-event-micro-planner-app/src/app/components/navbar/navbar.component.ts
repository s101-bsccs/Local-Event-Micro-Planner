import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { AccountProfile, UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  users: UserProfile[] = [];
  account: AccountProfile | null = null;
  currentUserId = '';
  themeLabel = 'Light';

  constructor() {
    this.userService.users$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((users) => {
      this.users = users;
    });

    this.userService.account$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((account) => {
      this.account = account;
    });

    this.userService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUserId = user?.id ?? '';
    });

    this.themeService.theme$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.themeLabel = theme === 'light' ? 'Light' : 'Dark';
    });
  }

  onUserSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.userService.setCurrentUser(target.value);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.userService.logout();
    void this.router.navigate(['/login']);
  }
}
