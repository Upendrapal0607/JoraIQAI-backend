import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'An unexpected server error occurred. Please try again.';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, any>;

        // DTO Validation errors from ValidationPipe
        if (Array.isArray(obj.message)) {
          message = obj.message.join('. ');
          details = obj.message;
        } else if (typeof obj.message === 'string') {
          message = obj.message;
        } else if (obj.error && typeof obj.error === 'string') {
          message = obj.error;
        }

        if (obj.details) {
          details = obj.details;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error [${request?.method} ${request?.url}]: ${exception.message}`,
        exception.stack,
      );
      if (exception.message.includes('Unique constraint')) {
        message = 'A user or record with these details already exists.';
      } else if (
        exception.message.includes('Record to update not found') ||
        exception.message.includes('Record to delete does not exist')
      ) {
        message = 'The requested resource was not found.';
      } else {
        message = 'An unexpected error occurred while processing your request.';
      }
    } else {
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)}`);
    }

    // Ensure user-friendly messages for standard HTTP status codes
    if (status === HttpStatus.UNAUTHORIZED && (message === 'Unauthorized' || message === 'Invalid credentials')) {
      message = 'Invalid email or password. Please verify your credentials.';
    } else if (status === HttpStatus.FORBIDDEN && message === 'Forbidden resource') {
      message = 'Access denied. You do not have permission to perform this action.';
    } else if (status === HttpStatus.NOT_FOUND && (message === 'Not Found' || message === 'Cannot GET')) {
      message = 'The requested resource or page was not found.';
    }

    const jsonResponse: Record<string, any> = {
      success: false,
      status,
      statusCode: status,
      message,
    };

    if (details !== undefined) {
      jsonResponse.details = details;
    }

    // Attach contextual metadata for debugging
    jsonResponse.error = {
      message,
      ...(details !== undefined ? { details } : {}),
      path: request?.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(jsonResponse);
  }
}
