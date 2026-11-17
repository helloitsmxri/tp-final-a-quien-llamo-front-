import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerDatosCobro } from './ver-datos-cobro';

describe('VerDatosCobro', () => {
  let component: VerDatosCobro;
  let fixture: ComponentFixture<VerDatosCobro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDatosCobro]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VerDatosCobro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
