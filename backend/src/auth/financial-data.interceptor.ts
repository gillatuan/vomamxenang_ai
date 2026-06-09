import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FinancialDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      map((data) => {
        // If user is STOREKEEPER, remove financial data
        if (user && user.role === 'STOREKEEPER') {
          return this.removeFinancialData(data);
        }
        return data;
      }),
    );
  }

  private removeFinancialData(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.removeFinancialData(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const cleaned = { ...data };

      // Remove financial fields
      const financialFields = [
        'importPrice',
        'sellingPrice',
        'price',
        'totalAmount',
        'amount',
        'revenue',
        'cost',
      ];

      financialFields.forEach((field) => {
        if (field in cleaned) {
          delete cleaned[field];
        }
      });

      // Recursively clean nested objects
      for (const key in cleaned) {
        if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
          cleaned[key] = this.removeFinancialData(cleaned[key]);
        }
      }

      return cleaned;
    }

    return data;
  }
}
