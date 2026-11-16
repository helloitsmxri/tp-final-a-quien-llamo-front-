import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderIzquierdo } from './header-izquierdo';

describe('HeaderIzquierdo', () => {
  let component: HeaderIzquierdo;
  let fixture: ComponentFixture<HeaderIzquierdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderIzquierdo]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderIzquierdo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
