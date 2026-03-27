import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardResponse } from '../../models/dashboard.model';
import { EventListComponent } from '../event-list/event-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EventListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @Input({ required: true }) dashboard!: DashboardResponse;
  @Output() bookmark = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
