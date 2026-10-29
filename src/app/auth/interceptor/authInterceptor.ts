import { HttpInterceptorFn } from "@angular/common/http";

const API = 'http://localhost:8080';

export const authInterceptor : HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token'); // jau q ponerle un nombre q sea como el q guardamos el token
    if (!token || !req.url.startsWith(API)){
        return next(req);
    }

    return next(req.clone({
        setHeaders : {Authorization : `Bearer ${token}`}
    }))
}