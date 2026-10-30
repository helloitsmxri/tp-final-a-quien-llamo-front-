import { HttpInterceptorFn } from "@angular/common/http";

const API = 'http://localhost:8080';

export const authInterceptor : HttpInterceptorFn = (req, next) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !req.url.startsWith(API)){
        return next(req);
    }

    return next(req.clone({
        setHeaders : {Authorization : `Bearer ${accessToken}`}
    }))
}