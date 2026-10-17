import { TestBed } from '@angular/core/testing';
import { Caracteristica } from './caracteristica';

describe('Caracteristica', () => {
  let service: Caracteristica;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Caracteristica);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
