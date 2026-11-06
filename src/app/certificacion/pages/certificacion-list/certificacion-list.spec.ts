import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificacionList } from './certificacion-list';

describe('CertificacionList', () => {
  let component: CertificacionList;
  let fixture: ComponentFixture<CertificacionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificacionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificacionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
