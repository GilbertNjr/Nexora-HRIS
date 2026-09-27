import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseEnvelope } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map((response) => {
        // If response is null or undefined
        if (response === undefined || response === null) {
          return {
            success: true,
            data: null,
          };
        }

        // If response already contains our envelope format
        if (
          typeof response === 'object' &&
          'success' in response &&
          ('data' in response || 'error' in response)
        ) {
          return response;
        }

        // Check if response contains pagination data { items, meta } or { data, meta }
        if (
          typeof response === 'object' &&
          'meta' in response &&
          ('items' in response || 'data' in response)
        ) {
          return {
            success: true,
            data: response.items || response.data,
            meta: response.meta,
          };
        }

        return {
          success: true,
          data: response,
        };
      }),
    );
  }
}
