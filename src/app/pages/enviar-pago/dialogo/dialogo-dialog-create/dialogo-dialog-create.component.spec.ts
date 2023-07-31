import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDialogCreateComponent } from './dialogo-dialog-create.component';

describe('DialogoDialogCreateComponent', () => {
  let component: DialogoDialogCreateComponent;
  let fixture: ComponentFixture<DialogoDialogCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDialogCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoDialogCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
