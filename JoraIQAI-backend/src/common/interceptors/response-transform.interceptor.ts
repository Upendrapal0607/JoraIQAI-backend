import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  statusCode?: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((result) => {
        const statusCode = response.statusCode || 200;

        // If response is already formatted as ApiResponse, return as is
        if (
          result &&
          typeof result === 'object' &&
          'success' in result &&
          'status' in result &&
          'message' in result
        ) {
          return result;
        }

        let message = 'Operation successful';
        let payload = result;

        // If controller returned an object with a custom message
        if (
          result &&
          typeof result === 'object' &&
          !Array.isArray(result) &&
          'message' in result &&
          typeof result.message === 'string'
        ) {
          message = result.message;
          if ('data' in result) {
            payload = result.data;
          } else {
            const { message: _, ...rest } = result;
            payload = Object.keys(rest).length > 0 ? rest : null;
          }
        } else {
          // Dynamic user-friendly message based on method & path
          const method = request?.method?.toUpperCase() || 'GET';
          const url = request?.url || '';

          if (url.includes('/auth/login')) {
            message = 'Login successful';
          } else if (url.includes('/auth/register')) {
            message = 'User registered successfully';
          } else if (url.includes('/auth/me')) {
            message = 'User profile retrieved successfully';
          } else if (url.includes('/auth/supabase-status')) {
            message = 'Supabase connection status retrieved successfully';
          } else if (url.includes('/quizzes') && method === 'POST') {
            message = 'Quiz created successfully';
          } else if (url.includes('/assign') || (url.includes('/assignments') && method === 'POST')) {
            message = 'Quiz assigned successfully';
          } else if (url.includes('/attempt') || (url.includes('/submit') && method === 'POST')) {
            message = 'Quiz submitted successfully';
          } else if (url.includes('/users')) {
            message = 'Users retrieved successfully';
          } else if (method === 'POST') {
            message = 'Resource created successfully';
          } else if (method === 'DELETE') {
            message = 'Resource deleted successfully';
          } else if (method === 'PUT' || method === 'PATCH') {
            message = 'Resource updated successfully';
          } else {
            message = 'Data retrieved successfully';
          }
        }

        return {
          success: true,
          status: statusCode,
          statusCode: statusCode,
          message,
          data: payload !== undefined ? payload : null,
        };
      }),
    );
  }
}
