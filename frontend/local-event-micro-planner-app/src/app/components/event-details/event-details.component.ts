import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventItem } from '../../models/event.model';
import { RSVPComponent } from '../rsvp/rsvp.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink, RSVPComponent],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent {
  @Input({ required: true }) event!: EventItem;
  @Input() currentUserId = '';
  @Output() bookmark = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() rsvp = new EventEmitter<'going' | 'not-going'>();
}
