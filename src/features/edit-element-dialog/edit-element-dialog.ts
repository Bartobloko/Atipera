import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PeriodicElement } from '../../utils/models/periodic-element';

@Component({
  selector: 'app-edit-element-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './edit-element-dialog.html',
  styleUrls: ['./edit-element-dialog.scss'],
})
export class EditElementDialog implements OnInit {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditElementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { element: PeriodicElement }
  ) {
    this.editForm = this.fb.group({
      position: [0, [Validators.required, Validators.min(1)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      symbol: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    if (this.data?.element) {
      this.editForm.patchValue(this.data.element);
    }
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedElement: PeriodicElement = {
        ...this.data.element,
        ...this.editForm.value
      };
      this.dialogRef.close(updatedElement);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
