import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPortfolio } from './form-portfolio';

describe('FormPortfolio', () => {
  let component: FormPortfolio;
  let fixture: ComponentFixture<FormPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPortfolio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
