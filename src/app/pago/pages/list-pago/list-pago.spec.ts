import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPago } from './list-pago';

describe('ListPago', () => {
  let component: ListPago;
  let fixture: ComponentFixture<ListPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPago]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPago);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
