import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarCuentaCreateDialogComponent } from './cargar-cuenta-create-dialog.component';

describe('CargarCuentaCreateDialogComponent', () => {
  let component: CargarCuentaCreateDialogComponent;
  let fixture: ComponentFixture<CargarCuentaCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargarCuentaCreateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarCuentaCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
