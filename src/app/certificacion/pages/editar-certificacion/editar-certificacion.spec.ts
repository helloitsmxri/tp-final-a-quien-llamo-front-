import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCertificacion } from './editar-certificacion';

describe('EditarCertificacion', () => {
  let component: EditarCertificacion;
  let fixture: ComponentFixture<EditarCertificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCertificacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCertificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
