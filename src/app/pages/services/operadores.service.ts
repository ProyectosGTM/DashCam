import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperadoresService {

  constructor(private http: HttpClient) { }

  obtenerOperadores(): Observable<any> {
    return this.http.get<any>(`${environment.API_SECURITY}/api/operadores`);
  }
  
}
