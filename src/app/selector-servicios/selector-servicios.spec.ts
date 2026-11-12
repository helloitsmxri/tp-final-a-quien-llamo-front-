import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorServicios } from './selector-servicios';

describe('SelectorServicios', () => {
  let component: SelectorServicios;
  let fixture: ComponentFixture<SelectorServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorServicios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
