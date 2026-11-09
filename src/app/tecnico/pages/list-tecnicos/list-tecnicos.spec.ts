import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTecnicos } from './list-tecnicos';

describe('ListTecnicos', () => {
  let component: ListTecnicos;
  let fixture: ComponentFixture<ListTecnicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTecnicos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTecnicos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
