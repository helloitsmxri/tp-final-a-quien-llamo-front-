import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRating } from './list-rating';

describe('ListRating', () => {
  let component: ListRating;
  let fixture: ComponentFixture<ListRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
