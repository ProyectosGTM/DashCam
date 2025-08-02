import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonederosServices {

  constructor(private http: HttpClient) { }

  obtenerMonederos(): Observable<any> {
    return this.http.get<any>(`${environment.API_SECURITY}/api/monederos`);
  }

  crearTransaccion(saveForm: any): Observable<any> {  // Cambiamos 'string' a 'any' para más flexibilidad
    return this.http.post(`${environment.API_SECURITY}/api/transacciones`, saveForm, {
        responseType: 'text' // Si esto no es necesario, cámbialo a 'json'
    }).pipe(
        catchError((err: HttpErrorResponse) => {
            let errorMessage = 'Ocurrió un error al registrar la transacción.';
            if (err.status === HttpStatusCode.BadRequest) {
                errorMessage = 'Datos incorrectos para la transacción.';
            } else if (err.status === HttpStatusCode.NotFound) {
                errorMessage = 'Recurso no encontrado.';
            } else if (err.status === HttpStatusCode.InternalServerError) {
                errorMessage = 'Ocurrió un error en el servidor.';
            }
            return throwError(errorMessage);
        })
    );
}

 
}