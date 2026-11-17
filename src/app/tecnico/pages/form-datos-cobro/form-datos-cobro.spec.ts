import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormDatosCobro } from './form-datos-cobro';

describe('FormDatosCobro', () => {
  let component: FormDatosCobro;
  let fixture: ComponentFixture<FormDatosCobro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDatosCobro]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormDatosCobro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
