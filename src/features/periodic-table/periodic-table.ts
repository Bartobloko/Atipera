import { Component, OnInit, inject, OnDestroy, effect, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './periodic-table.html',
  styleUrl: './periodic-table.scss'
})
export class PeriodicTable implements OnInit, OnDestroy {
  private readonly store = inject(PeriodicElementsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  readonly allElements = this.store.sortedElements; // Używamy sortedElements zamiast elements
  readonly loading = this.store.loading;

  searchControl = new FormControl('');
  filteredElements = signal<PeriodicElement[]>([]);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

  constructor() {
    effect(() => {
      const elements = this.allElements();
      const searchTerm = this.searchControl.value || '';
      this.filterElements(searchTerm);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.store.loadElements();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterElements(searchTerm || '');
      });

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

  onEditElement(element: PeriodicElement, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditElementDialog, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { element: { ...element } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.isValidUpdateResult(result)) {
        // Używamy metody updateElement z oryginalną pozycją
        this.store.updateElement(result.element, result.originalPosition);
        this.snackBar.open(
          `${result.element.name} updated successfully`,
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      }
    });
  }

  private isValidUpdateResult(result: any): boolean {
    return result &&
      result.element &&
      typeof result.originalPosition === 'number' &&
      this.isValidElement(result.element);
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
  }
}
