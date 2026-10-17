import { TestBed } from '@angular/core/testing';
import { Trabajo } from './trabajo';

describe('Trabajo', () => {
  let service: Trabajo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Trabajo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
