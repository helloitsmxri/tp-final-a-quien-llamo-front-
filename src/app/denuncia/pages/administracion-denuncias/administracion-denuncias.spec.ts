import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionDenuncias } from './administracion-denuncias';

describe('AdministracionDenuncias', () => {
  let component: AdministracionDenuncias;
  let fixture: ComponentFixture<AdministracionDenuncias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionDenuncias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministracionDenuncias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
