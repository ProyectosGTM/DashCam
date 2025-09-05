import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }

  obtenerClientes(): Observable<any> {
    return this.http.get<any>(`${environment.API_SECURITY}/api/clientes`);
  }
  
}
