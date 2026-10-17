import { TestBed } from '@angular/core/testing';
import { Habilidad } from './habilidad';

describe('Habilidad', () => {
  let service: Habilidad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Habilidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
