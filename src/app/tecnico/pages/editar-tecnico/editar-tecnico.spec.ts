import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTecnico } from './editar-tecnico';

describe('EditarTecnico', () => {
  let component: EditarTecnico;
  let fixture: ComponentFixture<EditarTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
