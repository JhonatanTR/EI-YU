import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarCuentaRemoveDialogComponent } from './cargar-cuenta-remove-dialog.component';

describe('CargarCuentaRemoveDialogComponent', () => {
  let component: CargarCuentaRemoveDialogComponent;
  let fixture: ComponentFixture<CargarCuentaRemoveDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargarCuentaRemoveDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarCuentaRemoveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
