import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rsvp.component.html',
  styleUrls: ['./rsvp.component.css']
})
export class RSVPComponent {
  @Input({ required: true }) event!: EventItem;
  @Input() currentUserId = '';
  @Output() statusChange = new EventEmitter<'going' | 'not-going'>();

  get isGoing(): boolean {
    return this.event.attendeeIds.includes(this.currentUserId);
  }
}
