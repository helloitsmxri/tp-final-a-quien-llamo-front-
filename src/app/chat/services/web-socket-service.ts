import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { MensajeModel } from '../../mensaje/models/mensaje-model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  
  private stompClient!: Client;

  constructor() {
    this.initWebSocket();
  }

  // Inicializamos la conexión STOMP sobre WebSocket
  private initWebSocket(): void {
    const token = localStorage.getItem('accessToken') || '';

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws', // URL del WebSocket en Spring Boot
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (msg) => console.log('[STOMP Debug]:', msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Conectado exitosamente al WebSocket');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Error STOMP:', frame.headers['message'], frame.body);
    };

    this.stompClient.activate();
  }

  // Permite suscribirse a las novedades de un chat específico
  suscribirseAlChat(uuidChat: string): Observable<MensajeModel> {
    const canalSubject = new Subject<MensajeModel>();

    const registrarSuscripcion = () => {
      this.stompClient.subscribe(`/topic/chat/${uuidChat}`, (message: Message) => {
        const nuevoMensaje: MensajeModel = JSON.parse(message.body);
        canalSubject.next(nuevoMensaje);
      });
    };

    if (this.stompClient.connected) {
      registrarSuscripcion();
    } else {
      this.stompClient.onConnect = () => {
        registrarSuscripcion();
      };
    }

    return canalSubject.asObservable();
  }

  // Emitir un mensaje en tiempo real hacia los demás conectados
  enviarMensajeWebSocket(uuidChat: string, mensaje: MensajeModel): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${uuidChat}`,
        body: JSON.stringify(mensaje)
      });
    } else {
      console.warn('El WebSocket no está conectado aún.');
    }
  }
}
