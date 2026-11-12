import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPortfolio } from './editar-portfolio';

describe('EditarPortfolio', () => {
  let component: EditarPortfolio;
  let fixture: ComponentFixture<EditarPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPortfolio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
