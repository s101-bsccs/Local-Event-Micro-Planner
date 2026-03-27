import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventItem } from '../../models/event.model';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent {
  @Input() title = 'Events';
  @Input() subtitle = '';
  @Input() events: EventItem[] = [];
  @Output() bookmark = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  trackById(index: number, event: EventItem): string {
    return event.id;
  }
}
