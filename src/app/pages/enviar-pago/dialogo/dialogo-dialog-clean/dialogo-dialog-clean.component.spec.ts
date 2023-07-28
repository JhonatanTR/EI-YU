import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDialogCleanComponent } from './dialogo-dialog-clean.component';

describe('DialogoDialogCleanComponent', () => {
  let component: DialogoDialogCleanComponent;
  let fixture: ComponentFixture<DialogoDialogCleanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoDialogCleanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoDialogCleanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
