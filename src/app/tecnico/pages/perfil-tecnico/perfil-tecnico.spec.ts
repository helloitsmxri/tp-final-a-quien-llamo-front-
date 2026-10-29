import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilTecnico } from './perfil-tecnico';

describe('PerfilTecnico', () => {
  let component: PerfilTecnico;
  let fixture: ComponentFixture<PerfilTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
