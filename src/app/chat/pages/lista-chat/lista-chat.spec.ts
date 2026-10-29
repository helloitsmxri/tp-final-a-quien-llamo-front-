import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaChat } from './lista-chat';

describe('ListaChat', () => {
  let component: ListaChat;
  let fixture: ComponentFixture<ListaChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
