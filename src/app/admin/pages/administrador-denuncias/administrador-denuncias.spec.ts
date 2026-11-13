import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorDenuncias } from './administrador-denuncias';

describe('AdministradorDenuncias', () => {
  let component: AdministradorDenuncias;
  let fixture: ComponentFixture<AdministradorDenuncias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorDenuncias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorDenuncias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
