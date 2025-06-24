import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatButtonModule,
    MatIconModule
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
      position: [0, [Validators.required, Validators.min(1), Validators.max(999)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      weight: [0, [Validators.required, Validators.min(0.0001)]],
      symbol: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(3)]]
    });
  }

  ngOnInit(): void {
    if (this.data?.element) {
      this.editForm.patchValue({
        position: this.data.element.position,
        name: this.data.element.name,
        weight: this.data.element.weight,
        symbol: this.data.element.symbol
      });
    }
  }

  onSave(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      const updatedElement: PeriodicElement = {
        position: Number(formValue.position),
        name: formValue.name.trim(),
        weight: Number(formValue.weight),
        symbol: formValue.symbol.trim()
      };
      this.dialogRef.close(updatedElement);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `${this.getFieldLabel(fieldName)} must be less than ${field.errors?.['max'].max}`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (field?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} must be no more than ${field.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      position: 'Position',
      name: 'Name',
      weight: 'Weight',
      symbol: 'Symbol'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
