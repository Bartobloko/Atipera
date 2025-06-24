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
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { PeriodicElementsStore } from '../../utils/store/periodic-elements.store';
import { PeriodicElement } from '../../utils/models/periodic-element';
import { EditElementDialog } from '../edit-element-dialog/edit-element-dialog';
import { MatTooltip } from '@angular/material/tooltip';

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
  private readonly snackBar = inject(MatSnackBar);
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
      const searchTerm = this.searchControl.value || '';
      this.filterElements(searchTerm);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.store.loadElements();

    // Setup search with reduced debounce time for better UX
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Reduced from 2000ms to 300ms
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

    // Show a subtle feedback
    this.snackBar.open(`Selected: ${element.name}`, '', {
      duration: 1500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  onEditElement(element: PeriodicElement, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditElementDialog, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { element: { ...element } } // Create a copy to avoid direct mutations
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Validate that we have a valid element
        if (this.isValidElement(result)) {
          this.store.updateElement(result);
          this.snackBar.open(
            `${result.name} updated successfully!`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar']
            }
          );
          console.log('Element updated:', result);
        } else {
          this.snackBar.open(
            'Invalid element data. Please check your inputs.',
            'Close',
            {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar']
            }
          );
        }
      }
    });
  }

  private isValidElement(element: any): element is PeriodicElement {
    return element &&
      typeof element.position === 'number' &&
      typeof element.name === 'string' &&
      typeof element.weight === 'number' &&
      typeof element.symbol === 'string' &&
      element.position > 0 &&
      element.name.trim().length > 0 &&
      element.weight > 0 &&
      element.symbol.trim().length > 0;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.filteredElements.set(this.allElements());
  }

  // Helper method to get result count text
  getResultsText(): string {
    const total = this.elementsCount();
    const filtered = this.filteredElements().length;

    if (this.searchControl.value) {
      return `Showing ${filtered} of ${total} elements`;
    }
    return `${total} elements`;
  }
}
