import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorCertificaciones } from './administrador-certificaciones';

describe('AdministradorCertificaciones', () => {
  let component: AdministradorCertificaciones;
  let fixture: ComponentFixture<AdministradorCertificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorCertificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorCertificaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
