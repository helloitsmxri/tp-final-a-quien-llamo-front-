import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPresupuesto } from './ver-presupuesto';

describe('VerPresupuesto', () => {
  let component: VerPresupuesto;
  let fixture: ComponentFixture<VerPresupuesto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPresupuesto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerPresupuesto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
