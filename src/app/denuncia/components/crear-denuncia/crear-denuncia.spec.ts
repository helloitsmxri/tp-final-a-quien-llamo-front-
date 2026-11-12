import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDenuncia } from './crear-denuncia';

describe('CrearDenuncia', () => {
  let component: CrearDenuncia;
  let fixture: ComponentFixture<CrearDenuncia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDenuncia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDenuncia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
