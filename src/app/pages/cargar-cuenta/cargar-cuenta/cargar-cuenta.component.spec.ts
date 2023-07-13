import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarCuentaComponent } from './cargar-cuenta.component';

describe('CargarCuentaComponent', () => {
  let component: CargarCuentaComponent;
  let fixture: ComponentFixture<CargarCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargarCuentaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
