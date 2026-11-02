import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilEdicion } from './perfil-edicion';

describe('PerfilEdicion', () => {
  let component: PerfilEdicion;
  let fixture: ComponentFixture<PerfilEdicion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEdicion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilEdicion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
