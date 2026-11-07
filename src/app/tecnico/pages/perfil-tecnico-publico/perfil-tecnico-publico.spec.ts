import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilTecnicoPublico } from './perfil-tecnico-publico';

describe('PerfilTecnicoPublico', () => {
  let component: PerfilTecnicoPublico;
  let fixture: ComponentFixture<PerfilTecnicoPublico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilTecnicoPublico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilTecnicoPublico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
