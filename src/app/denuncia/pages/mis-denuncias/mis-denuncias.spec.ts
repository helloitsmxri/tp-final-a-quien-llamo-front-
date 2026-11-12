import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisDenuncias } from './mis-denuncias';

describe('MisDenuncias', () => {
  let component: MisDenuncias;
  let fixture: ComponentFixture<MisDenuncias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisDenuncias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisDenuncias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
