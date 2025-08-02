// ✅ Nuevo interceptor funcional compatible con withInterceptors()
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/auth.service';

export const interceptServiceInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthenticationService);
  const token = auth.getToken();

  // ✅ Si hay token, lo agrega al header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ✅ Solo agrega Content-Type si NO es FormData
  if (!(req.body instanceof FormData)) {
    if (!req.headers.has('Content-Type')) {
      req = req.clone({
        setHeaders: { 'Content-Type': 'application/json' }
      });
    }
  }

  return next(req);
};
