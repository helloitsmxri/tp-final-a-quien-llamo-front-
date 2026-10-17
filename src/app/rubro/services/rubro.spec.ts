import { TestBed } from '@angular/core/testing';
import { Rubro } from './rubro';

describe('Rubro', () => {
  let service: Rubro;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rubro);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
