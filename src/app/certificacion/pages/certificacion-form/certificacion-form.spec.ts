import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificacionForm } from './certificacion-form';

describe('CertificacionForm', () => {
  let component: CertificacionForm;
  let fixture: ComponentFixture<CertificacionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificacionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificacionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
