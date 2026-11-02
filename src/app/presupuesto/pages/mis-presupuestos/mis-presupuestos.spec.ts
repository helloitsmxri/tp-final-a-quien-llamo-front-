import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPresupuestos } from './mis-presupuestos';

describe('MisPresupuestos', () => {
  let component: MisPresupuestos;
  let fixture: ComponentFixture<MisPresupuestos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPresupuestos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisPresupuestos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
