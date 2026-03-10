import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Duplicate Key Error (E11000)
    if (exception.code === 11000) {
      const field = Object.keys(exception.keyPattern)[0];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: message,
        error: 'Conflict',
      });
    }

    // Default error handling for other Mongo errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'DatabaseError',
    });
  }
}
