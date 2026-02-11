import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, share, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleSheetService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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

  readTradingLogs(): Observable<{ data: any[]; length: number }> {
    return this.http.get<{ data: any[]; length: number }>(
      `${this.apiUrl}?action=readTradingLogs`
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
    );
  }

  updateTradingLog(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=updateTradingLog`,
      JSON.stringify(data)
    );
  }

  deleteTradingLog(rowIndex: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}?action=deleteTradingLog`,
      JSON.stringify({ rowIndex })
    );
  }

  // ==================== Master Data Methods ====================

  readExchanges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=readExchanges`);
  }

  readAccountOwners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=readAccountOwners`);
  }

  readStrategyNames(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=readStrategyNames`);
  }
}

//https://script.google.com/macros/s/AKfycbwLM3S5PsUBR5Jf1lUrGPtAdanLxDUWqgbfaTQ-FdZn4E2f1J5p-5IxzIS9LFaNVEem/exec
