import { TestBed } from '@angular/core/testing';
import { Certificacion } from './certificacion';

describe('Certificacion', () => {
  let service: Certificacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Certificacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
