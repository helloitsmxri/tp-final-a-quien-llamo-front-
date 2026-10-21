import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTrabajo } from './list-trabajo';

describe('ListTrabajo', () => {
  let component: ListTrabajo;
  let fixture: ComponentFixture<ListTrabajo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTrabajo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTrabajo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
