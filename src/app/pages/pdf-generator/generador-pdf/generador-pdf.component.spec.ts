import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradorPdfComponent } from './generador-pdf.component';

describe('GeneradorPdfComponent', () => {
  let component: GeneradorPdfComponent;
  let fixture: ComponentFixture<GeneradorPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneradorPdfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneradorPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
