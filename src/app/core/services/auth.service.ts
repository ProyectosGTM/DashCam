import { Injectable } from '@angular/core';
import { User } from '../../entities/User';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { BaseServicesService } from './base.service';
import { Credentials } from 'src/app/entities/Credentials';

@Injectable({ providedIn: 'root' })
export class AuthenticationService extends BaseServicesService {
  private authenticationChanged = new Subject<boolean>();
  private user: User | null = new User();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    super();
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public isAuthenticationChanged(): any {
    return this.authenticationChanged.asObservable();
  }

  clearUserData() {
    this.user = null;
    sessionStorage.clear();
    this.authenticationChanged.next(false);
  }

  /** ✅ Obtiene el token (o null si no existe) */
  public getToken(): string | null {
    const token = sessionStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      return null;
    }
    return token; // ✅ Ya no usamos JSON.parse
  }

  /** ✅ Guarda datos del usuario después de login */
  public setData(data: User): void {
    this.setStorageToken(data.token);
    this.setStorageUser(data);
    this.setStoragePermissions(data.permisos);
  }

  public failToken(): void {
    this.cleanSession();
  }

  public async logout(): Promise<void> {
    try {
      window.location.reload();
      console.log('Datos en sessionStorage antes de limpiar:', sessionStorage);
      console.log('Datos en localStorage antes de limpiar:', localStorage);

      sessionStorage.clear();
      localStorage.clear();

      console.log('Datos en sessionStorage después de limpiar:', sessionStorage);
      console.log('Datos en localStorage después de limpiar:', localStorage);

      this.authenticationChanged.next(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /** ✅ Guarda el token sin JSON.stringify */
  private setStorageToken(value: any): void {
    sessionStorage.setItem("token", value); // ✅ ya no se hace JSON.stringify
    this.authenticationChanged.next(this.isAuthenticated());
  }

  /** ✅ Guarda el usuario completo */
  private setStorageUser(value: any): void {
    const _value = JSON.stringify(value);
    sessionStorage.setItem("user", _value);
    this.authenticationChanged.next(this.isAuthenticated());
  }

  public setStorageCoordinate(coordinates: any): void {
    const coords = JSON.stringify(coordinates);
    sessionStorage.setItem("coordinates", coords);
  }

  updateUsuario(id: string, form: any): Observable<any> {
    return this.http.put<any>(
      `${environment.API_SECURITY}/api/controlusuarios/${id}`,
      form
    );
  }

  getUsuarioControl(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.API_SECURITY}/api/controlusuarios/${id}`
    );
  }

  private setStoragePermissions(permissions: Array<string>): void {
    const _value = JSON.stringify(permissions);
    sessionStorage.setItem("permissions", _value);
    this.authenticationChanged.next(this.isAuthenticated());
  }

  public cleanSession() {
    sessionStorage.clear();
  }

  public getUser(): User | null {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  public getCoordinates(): any {
    const coords = sessionStorage.getItem("coordinates");
    return coords ? JSON.parse(coords) : null;
  }

  public getPermissions(): string[] {
    const permissions = sessionStorage.getItem("permissions");
    return permissions ? JSON.parse(permissions) : [];
  }

  /** ✅ Llama al login y maneja token */
  public authenticate(body: Credentials): Observable<User> {
    return this.http.post<User>(environment.API_SECURITY + "/api/login", body)
      .pipe(catchError(this.handleError));
  }
}
