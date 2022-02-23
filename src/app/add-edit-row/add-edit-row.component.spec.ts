import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRowComponent } from './add-edit-row.component';

describe('AddEditRowComponent', () => {
  let component: AddEditRowComponent;
  let fixture: ComponentFixture<AddEditRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
