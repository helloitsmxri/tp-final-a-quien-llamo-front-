import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorPortfolio } from './administrador-portfolio';

describe('AdministradorPortfolio', () => {
  let component: AdministradorPortfolio;
  let fixture: ComponentFixture<AdministradorPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorPortfolio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
