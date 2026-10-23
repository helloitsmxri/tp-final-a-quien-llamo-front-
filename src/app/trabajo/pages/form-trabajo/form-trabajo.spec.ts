import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTrabajo } from './form-trabajo';

describe('FormTrabajo', () => {
  let component: FormTrabajo;
  let fixture: ComponentFixture<FormTrabajo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTrabajo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTrabajo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
