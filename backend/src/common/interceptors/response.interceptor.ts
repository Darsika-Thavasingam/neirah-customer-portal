import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();

    // Intercept only API calls and exclude Swagger docs
    if (request.url.startsWith('/api/') && !request.url.startsWith('/api/docs')) {
      return next.handle().pipe(
        map((data) => {
          // If the data is already wrapped, return as is
          if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
            return data;
          }
          return {
            success: true,
            message: 'Operation completed successfully',
            data: data ?? {},
            meta: {},
          };
        }),
      );
    }

    return next.handle();
  }
}
