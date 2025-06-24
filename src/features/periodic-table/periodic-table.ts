import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { PeriodicElementsStore } from '../../utils/store/periodic-elements.store';
import { PeriodicElement } from '../../utils/models/periodic-element';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './periodic-table.html',
  styleUrl: './periodic-table.scss'
})
export class PeriodicTable implements OnInit {
  private readonly store = inject(PeriodicElementsStore);

  // Sygnały z store
  readonly elements = this.store.elements;
  readonly loading = this.store.loading;
  readonly elementsCount = this.store.elementsCount;

  // Kolumny zgodnie z najnowszą dokumentacją Material
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  ngOnInit(): void {
    this.store.loadElements();
  }

  onRowClick(element: PeriodicElement): void {
    this.store.selectElement(element);
    console.log('Selected element:', element);
  }
}
