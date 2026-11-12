import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { MensajeModel } from '../../mensaje/models/mensaje-model';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private conectado$ = new BehaviorSubject<boolean>(false);

  // Se conecta una sola vez
  conectar(): void {
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      beforeConnect: () => {
        this.client!.connectHeaders = {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        };
      },
    });

    this.client.onConnect = () => this.conectado$.next(true);
    this.client.onWebSocketClose = () => this.conectado$.next(false);
    this.client.onStompError = (f) => console.error('Error STOMP:', f.headers['message'], f.body);
    this.client.activate();
  }

  // Emite cada mensaje nuevo del chat. Al desuscribirte, deja de escuchar.
  escucharChat(uuidChat: string): Observable<MensajeModel> {
    this.conectar();

    return new Observable<MensajeModel>((observer) => {
      let sub: StompSubscription | undefined;

      // Se re-suscribe sola cada vez que la conexión se (re)establece
      const conexion = this.conectado$.subscribe((ok) => {
        if (!ok) return;
        sub = this.client!.subscribe(`/topic/chat/${uuidChat}`, (msg: IMessage) =>
          observer.next(JSON.parse(msg.body) as MensajeModel),
        );
      });

      return () => {
        conexion.unsubscribe();
        try { sub?.unsubscribe(); } catch {}
      };
    });
  }

  ngOnDestroy(): void {
    this.client?.deactivate();
  }
}