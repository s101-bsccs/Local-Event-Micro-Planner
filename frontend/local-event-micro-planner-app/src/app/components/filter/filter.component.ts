import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventFilters } from '../../models/event.model';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnChanges {
  @Input() categories: string[] = [];
  @Input() cities: string[] = [];
  @Input({ required: true }) filters!: EventFilters;
  @Output() filtersChange = new EventEmitter<EventFilters>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly filterForm = this.formBuilder.group({
    category: [''],
    city: [''],
    date: [''],
    status: ['']
  });

  ngOnInit(): void {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.filtersChange.emit({
        ...this.filters,
        category: value.category ?? '',
        city: value.city ?? '',
        date: value.date ?? '',
        status: value.status ?? ''
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.filterForm.patchValue({
        category: this.filters.category,
        city: this.filters.city,
        date: this.filters.date,
        status: this.filters.status
      }, { emitEvent: false });
    }
  }

  resetFilters(): void {
    this.filterForm.reset({ category: '', city: '', date: '', status: '' });
  }
}
