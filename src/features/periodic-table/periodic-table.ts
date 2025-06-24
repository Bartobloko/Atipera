import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PeriodicElementsStore } from '../../utils/store/periodic-elements.store';
import { PeriodicElement } from '../../utils/models/periodic-element';
import {EditElementDialog} from '../edit-element-dialog/edit-element-dialog';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './periodic-table.html',
  styleUrl: './periodic-table.scss'
})
export class PeriodicTable implements OnInit {
  private readonly store = inject(PeriodicElementsStore);
  private readonly dialog = inject(MatDialog);

  readonly elements = this.store.elements;
  readonly loading = this.store.loading;
  readonly elementsCount = this.store.elementsCount;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

  ngOnInit(): void {
    this.store.loadElements();
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
}
