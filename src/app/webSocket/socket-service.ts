import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(private socket: Socket) {
   }

  listen(eventName: string) {
    return new Observable( subscriber => {
        this.socket.on(eventName, data => {
            subscriber.next(data);
        });
    });
  }

  emit(eventName: string, data) {
      this.socket.emit(eventName, data);
  }

}
