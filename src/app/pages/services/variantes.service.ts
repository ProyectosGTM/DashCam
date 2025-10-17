import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VariantesService {

  constructor(private http: HttpClient) { }

  obtenerVariantesData(page: number, pageSize: number): Observable<any> {
    return this.http.get(`${environment.API_SECURITY}/variantes/${page}/${pageSize}`);
  }

  obtenerVariantes(): Observable<any> {
    return this.http.get(`${environment.API_SECURITY}/variantes/list`);
  }

  agregarVariante(data: any) {
    return this.http.post(environment.API_SECURITY + '/variantes', data);
  }

  eliminarVariante(idVariante: Number) {
    return this.http.delete(environment.API_SECURITY + '/variantes/eliminado/total/' + idVariante);
  }

  obtenerVariante(idVariante: number): Observable<any> {
    return this.http.get<any>(environment.API_SECURITY + '/variantes/' + idVariante);
  }

  actualizarVariante(idVariante: number, saveForm: any): Observable<any> {
    return this.http.put(`${environment.API_SECURITY}/variantes/` + idVariante, saveForm);
  }

  private apiUrl = `${environment.API_SECURITY}/variantes`;
  updateEstatus(id: number, estatus: number): Observable<string> {
    const url = `${this.apiUrl}/estatus/${id}`;
    const body = { estatus };
    return this.http.patch(url, body, { responseType: 'text' }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}