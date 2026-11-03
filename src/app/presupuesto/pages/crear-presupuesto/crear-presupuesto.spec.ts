import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPresupuesto } from './crear-presupuesto';

describe('CrearPresupuesto', () => {
  let component: CrearPresupuesto;
  let fixture: ComponentFixture<CrearPresupuesto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPresupuesto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPresupuesto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
