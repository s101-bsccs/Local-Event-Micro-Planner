import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastOutletComponent } from './components/toast-outlet/toast-outlet.component';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastOutletComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.themeService.initializeTheme();
    this.userService.restoreSession().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => {
        this.userService.logout();
      }
    });
  }
}
