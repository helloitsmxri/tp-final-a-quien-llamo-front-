import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleCertificacion } from './detalle-certificacion';

describe('DetalleCertificacion', () => {
  let component: DetalleCertificacion;
  let fixture: ComponentFixture<DetalleCertificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCertificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCertificacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
