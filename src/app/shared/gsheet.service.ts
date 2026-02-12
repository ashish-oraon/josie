import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, share, shareReplay, switchMap, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CacheService } from './services/cache.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetService {
  private readonly apiUrl = environment.apiUrl;
  private forceRefresh = false; // Flag to bypass cache when refreshing

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  readData(
    type: string = 'readTransactions',
    sheet: string = 'June-2023',
    id?: number
  ): Observable<any> {
    switch (type) {
      case 'readTransactions':
        return this.http.get<any>(
          `${this.apiUrl}?action=${type}&sheet=${sheet}`
        );
      case 'readSingleTransaction':
        return this.http.get<any>(
          `${this.apiUrl}?action=${type}&sheet=${sheet}&id=${id}`
        );
      default:
        return this.http.get<any>(`${this.apiUrl}?action=${type}`);
    }
  }

  createData(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=create`,
      JSON.stringify(data)
    );
  }

  updateData(
    payload: any,
    id: number,
    sheet: string = 'transaction'
  ): Observable<any> {
    const data = { values: payload, rowIndex: id, sheetName: sheet };
    return this.http.post<any>(
      `${this.apiUrl}?action=update`,
      JSON.stringify(data)
    );
  }

  deleteData(rowIndex: number, sheetName: string): Observable<any> {
    const data = { rowIndex, sheetName };
    return this.http.post<any>(
      `${this.apiUrl}?action=delete&rowIndex=${rowIndex}`,
      JSON.stringify(data)
    );
  }

  login(creds: any) {
    return this.http.post<any>(
      `${this.apiUrl}?action=login`,
      JSON.stringify(creds)
    );
  }

  // ==================== Trading Log Methods ====================

  readTradingLogs(forceRefresh: boolean = false): Observable<{ data: any[]; length: number }> {
    const cacheKey = 'tradingLogs';
    
    if (!forceRefresh) {
      return this.cacheService.get<{ data: any[]; length: number }>('tradingLogs', cacheKey).pipe(
        switchMap((cachedData) => {
          if (cachedData) {
            return of(cachedData);
          }
          return this.fetchTradingLogs(cacheKey);
        })
      );
    }
    
    return this.fetchTradingLogs(cacheKey);
  }

  private fetchTradingLogs(cacheKey: string): Observable<{ data: any[]; length: number }> {
    return this.http.get<{ data: any[]; length: number }>(
      `${this.apiUrl}?action=readTradingLogs`
    ).pipe(
      tap((data) => {
        // Cache the response
        this.cacheService.set('tradingLogs', cacheKey, data).subscribe();
      }),
      catchError((error) => {
        // If API fails, try to return cached data
        return this.cacheService.get<{ data: any[]; length: number }>('tradingLogs', cacheKey).pipe(
          switchMap((cachedData) => {
            if (cachedData) {
              return of(cachedData);
            }
            throw error;
          })
        );
      })
    );
  }

  readSingleTradingLog(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?action=readSingleTradingLog&id=${id}`
    );
  }

  createTradingLog(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=createTradingLog`,
      JSON.stringify(data)
    ).pipe(
      tap(() => {
        // Invalidate cache after create
        this.cacheService.remove('tradingLogs', 'tradingLogs').subscribe();
        this.cacheService.remove('masterData', 'activeTrades').subscribe();
      })
    );
  }

  updateTradingLog(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=updateTradingLog`,
      JSON.stringify(data)
    ).pipe(
      tap(() => {
        // Invalidate cache after update
        this.cacheService.remove('tradingLogs', 'tradingLogs').subscribe();
        this.cacheService.remove('masterData', 'activeTrades').subscribe();
      })
    );
  }

  deleteTradingLog(rowIndex: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=deleteTradingLog`,
      JSON.stringify({ rowIndex })
    ).pipe(
      tap(() => {
        // Invalidate cache after delete
        this.cacheService.remove('tradingLogs', 'tradingLogs').subscribe();
        this.cacheService.remove('masterData', 'activeTrades').subscribe();
      })
    );
  }

  // ==================== Master Data Methods ====================

  readExchanges(forceRefresh: boolean = false): Observable<any[]> {
    const cacheKey = 'exchanges';
    
    if (!forceRefresh) {
      return this.cacheService.get<any[]>('masterData', cacheKey).pipe(
        switchMap((cachedData) => {
          if (cachedData) {
            return of(cachedData);
          }
          return this.fetchExchanges(cacheKey);
        })
      );
    }
    
    return this.fetchExchanges(cacheKey);
  }

  private fetchExchanges(cacheKey: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=readExchanges`).pipe(
      tap((data) => {
        this.cacheService.set('masterData', cacheKey, data, 30 * 60 * 1000).subscribe(); // 30 min cache
      })
    );
  }

  readAccountOwners(forceRefresh: boolean = false): Observable<any[]> {
    const cacheKey = 'accountOwners';
    
    if (!forceRefresh) {
      return this.cacheService.get<any[]>('masterData', cacheKey).pipe(
        switchMap((cachedData) => {
          if (cachedData) {
            return of(cachedData);
          }
          return this.fetchAccountOwners(cacheKey);
        })
      );
    }
    
    return this.fetchAccountOwners(cacheKey);
  }

  private fetchAccountOwners(cacheKey: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=readAccountOwners`).pipe(
      tap((data) => {
        this.cacheService.set('masterData', cacheKey, data, 30 * 60 * 1000).subscribe(); // 30 min cache
      })
    );
  }

  readStrategyNames(forceRefresh: boolean = false): Observable<any[]> {
    const cacheKey = 'strategyNames';
    
    if (!forceRefresh) {
      return this.cacheService.get<any[]>('masterData', cacheKey).pipe(
        switchMap((cachedData) => {
          if (cachedData) {
            return of(cachedData);
          }
          return this.fetchStrategyNames(cacheKey);
        })
      );
    }
    
    return this.fetchStrategyNames(cacheKey);
  }

  private fetchStrategyNames(cacheKey: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=readStrategyNames`).pipe(
      tap((data) => {
        this.cacheService.set('masterData', cacheKey, data, 30 * 60 * 1000).subscribe(); // 30 min cache
      })
    );
  }

  // ==================== Profit Booking Methods ====================

  readActiveTrades(forceRefresh: boolean = false): Observable<{ data: any[]; length: number }> {
    const cacheKey = 'activeTrades';
    
    if (!forceRefresh) {
      return this.cacheService.get<{ data: any[]; length: number }>('activeTrades', cacheKey).pipe(
        switchMap((cachedData) => {
          if (cachedData) {
            return of(cachedData);
          }
          return this.fetchActiveTrades(cacheKey);
        })
      );
    }
    
    return this.fetchActiveTrades(cacheKey);
  }

  private fetchActiveTrades(cacheKey: string): Observable<{ data: any[]; length: number }> {
    return this.http.get<{ data: any[]; length: number }>(
      `${this.apiUrl}?action=readActiveTrades`
    ).pipe(
      tap((data) => {
        this.cacheService.set('activeTrades', cacheKey, data).subscribe();
      })
    );
  }

  readProfitBookings(forceRefresh: boolean = false): Observable<{ data: any[]; length: number }> {
    const cacheKey = 'profitBookings';
    
    if (!forceRefresh) {
      return this.cacheService.get<{ data: any[]; length: number }>('profitBookings', cacheKey).pipe(
        switchMap((cachedData) => {
          if (cachedData) {
            return of(cachedData);
          }
          return this.fetchProfitBookings(cacheKey);
        })
      );
    }
    
    return this.fetchProfitBookings(cacheKey);
  }

  private fetchProfitBookings(cacheKey: string): Observable<{ data: any[]; length: number }> {
    return this.http.get<{ data: any[]; length: number }>(
      `${this.apiUrl}?action=readProfitBookings`
    ).pipe(
      tap((data) => {
        this.cacheService.set('profitBookings', cacheKey, data).subscribe();
      }),
      catchError((error) => {
        // If API fails, try to return cached data
        return this.cacheService.get<{ data: any[]; length: number }>('profitBookings', cacheKey).pipe(
          switchMap((cachedData) => {
            if (cachedData) {
              return of(cachedData);
            }
            throw error;
          })
        );
      })
    );
  }

  readSingleProfitBooking(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?action=readSingleProfitBooking&id=${id}`
    );
  }

  createProfitBooking(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=createProfitBooking`,
      JSON.stringify(data)
    ).pipe(
      tap(() => {
        // Invalidate cache after create
        this.cacheService.remove('profitBookings', 'profitBookings').subscribe();
        this.cacheService.remove('activeTrades', 'activeTrades').subscribe();
        this.cacheService.remove('tradingLogs', 'tradingLogs').subscribe();
      })
    );
  }
}

//https://script.google.com/macros/s/AKfycbwLM3S5PsUBR5Jf1lUrGPtAdanLxDUWqgbfaTQ-FdZn4E2f1J5p-5IxzIS9LFaNVEem/exec
