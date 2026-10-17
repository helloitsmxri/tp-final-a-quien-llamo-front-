import { TestBed } from '@angular/core/testing';
import { Denuncia } from './denuncia';

describe('Denuncia', () => {
  let service: Denuncia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Denuncia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
