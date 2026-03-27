import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventItem;
  @Output() bookmark = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onBookmark(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.bookmark.emit(this.event.id);
  }

  onDelete(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.event.id);
  }
}
