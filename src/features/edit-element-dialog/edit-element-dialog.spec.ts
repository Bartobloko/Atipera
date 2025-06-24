import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditElementDialog } from './edit-element-dialog';

describe('EditElementDialog', () => {
  let component: EditElementDialog;
  let fixture: ComponentFixture<EditElementDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditElementDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditElementDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
