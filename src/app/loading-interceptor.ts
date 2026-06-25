import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Siinax } from './siinax';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  let service = inject(Siinax)

  service.loaderTruck.next(true)

  return next(req).pipe(
    finalize(() => {
      service.loaderTruck.next(false)
    })
  );
};
