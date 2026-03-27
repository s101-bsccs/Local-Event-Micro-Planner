import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EventFormPayload, EventItem, SuggestionResponse } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnChanges {
  @Input() event: EventItem | null = null;
  @Input() suggestions: SuggestionResponse | null = null;
  @Output() submitted = new EventEmitter<EventFormPayload>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() cityChange = new EventEmitter<string>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly suggestedCategories = ['Community', 'Workshop', 'Food', 'Networking', 'Wellness', 'Arts'];

  readonly eventForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(12)]],
    category: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    location: ['', Validators.required],
    city: ['', Validators.required],
    capacity: [20, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    this.eventForm.controls.city.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((city) => {
        if (city.trim()) {
          this.cityChange.emit(city.trim());
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.eventForm.patchValue({
        title: this.event.title,
        description: this.event.description,
        category: this.event.category,
        date: this.event.date,
        time: this.event.time,
        location: this.event.location,
        city: this.event.city,
        capacity: this.event.capacity
      }, { emitEvent: false });
    }
  }

  applySuggestedTime(): void {
    if (this.suggestions?.recommendedTime) {
      this.eventForm.controls.time.setValue(this.suggestions.recommendedTime);
    }
  }

  chooseCategory(category: string): void {
    this.eventForm.controls.category.setValue(category);
  }

  submitForm(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.eventForm.getRawValue());
  }
}
