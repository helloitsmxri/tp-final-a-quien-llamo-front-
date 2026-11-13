import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorBloquearCuenta } from './administrador-bloquear-cuenta';

describe('AdministradorBloquearCuenta', () => {
  let component: AdministradorBloquearCuenta;
  let fixture: ComponentFixture<AdministradorBloquearCuenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorBloquearCuenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorBloquearCuenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
