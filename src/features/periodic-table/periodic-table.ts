import { Component, OnInit, inject, OnDestroy, effect, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { PeriodicElementsStore } from '../../utils/store/periodic-elements.store';
import { PeriodicElement } from '../../utils/models/periodic-element';
import { EditElementDialog } from '../edit-element-dialog/edit-element-dialog';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltip
  ],
  templateUrl: './periodic-table.html',
  styleUrl: './periodic-table.scss'
})
export class PeriodicTable implements OnInit, OnDestroy {
  private readonly store = inject(PeriodicElementsStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  readonly allElements = this.store.elements;
  readonly loading = this.store.loading;
  readonly elementsCount = this.store.elementsCount;

  searchControl = new FormControl('');
  filteredElements = signal<PeriodicElement[]>([]);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

  constructor() {
    // React to changes in store elements using effect
    effect(() => {
      const elements = this.allElements();
      if (this.searchControl.value) {
        this.filterElements(this.searchControl.value);
      } else {
        this.filteredElements.set(elements);
      }
    });
  }

  ngOnInit(): void {
    this.store.loadElements();

    // Setup search with 2 second debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterElements(searchTerm || '');
      });

    // Initialize filtered elements
    this.filteredElements.set(this.allElements());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterElements(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredElements.set(this.allElements());
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = this.allElements().filter(element =>
      element.name.toLowerCase().includes(term) ||
      element.symbol.toLowerCase().includes(term) ||
      element.position.toString().includes(term) ||
      element.weight.toString().includes(term)
    );
    this.filteredElements.set(filtered);
  }

  onRowClick(element: PeriodicElement): void {
    this.store.selectElement(element);
    console.log('Selected element:', element);
  }

  onEditElement(element: PeriodicElement, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditElementDialog, {
      width: '500px',
      data: { element }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.updateElement(result);
        console.log('Element updated:', result);
      }
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.filteredElements.set(this.allElements());
  }
}
