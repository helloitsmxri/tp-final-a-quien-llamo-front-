import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRating } from './form-rating';

describe('FormRating', () => {
  let component: FormRating;
  let fixture: ComponentFixture<FormRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
