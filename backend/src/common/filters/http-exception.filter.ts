import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'An unexpected error occurred';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      const resBody = exception.getResponse();
      if (typeof resBody === 'string') {
        message = resBody;
      } else if (typeof resBody === 'object' && resBody !== null) {
        message = (resBody as any).message || exception.message || message;
        errorCode = (resBody as any).error || (resBody as any).code || errorCode;
        
        if (Array.isArray((resBody as any).message)) {
          message = 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
          details = (resBody as any).message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (request.url.startsWith('/api/') && !request.url.startsWith('/api/docs')) {
      response.status(status).json({
        success: false,
        message,
        error: {
          code: errorCode,
          details,
        },
      });
    } else {
      response.status(status).json(
        exception instanceof HttpException
          ? exception.getResponse()
          : { statusCode: status, message }
      );
    }
  }
}
