import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  private apiUrl = 'https://graph.facebook.com/v21.0/545046085348393/messages';
  private accessToken = 'EAAlgu0rBwIYBO4zj0SZCbPiFe37ey0LH2ZB5zGHP9Nsn6pR2jJKxkbrWRuO7K14WmxxO7XCRH7M0MxuJcfL6AwWrZBneVcfwzHJv1CwXLym8DCIBUUXqsE88TxtfKZAkuVm3wopBwwiKtGgRLRXRcgDiz5NTygZBcZBb0Y3vlOZAgInX7lKtKzAGesCZBkKD7Qe3bJUfyYRMFdvJ7eM25QGLbHxNZAmgef2cOd58T2sR8';

  private webhookUrl = 'https://us-central1-movil-torisimo.cloudfunctions.net/whatsappWebhook';

  constructor(private http: HttpClient) { }

  sendMessage(telefono: string, message: string): Promise<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: {
        body: message
      }
    };

    return lastValueFrom(
      this.http.post(this.apiUrl, body, { headers })
    );
  }

  enviarMensaje(telefono: string, message: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: {
        body: message
      }
    };
    return this.http.post<any>(this.apiUrl, body, { headers });
  }



  enviarBotones(telefono: string, mensaje: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    const body = {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: mensaje, // El mensaje dinámico
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'disponible',
                title: 'Estoy disponible',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'no_disponible',
                title: 'No estoy disponible',
              },
            },
          ],
        },
      },
    };

    return this.http.post<any>(this.apiUrl, body, { headers }
    );
  }

  // OBTENER RESPUESTAS
  testWebhook(payload: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(this.webhookUrl, payload, { headers });
  }

  /* 
  curl -i -X POST \
  https://graph.facebook.com/v21.0/500620986465831/messages \
  -H 'Authorization: Bearer <access token>' \
  -H 'Content-Type: application/json' \
  -d '{ "messaging_product": "whatsapp", "to": "", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }'
  */


  addPersona(datos: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`https://us-central1-movil-torisimo.cloudfunctions.net/addPersona`, datos);
  }
}
