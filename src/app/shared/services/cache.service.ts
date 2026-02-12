import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private dbName = 'TradingLogCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
    };

    request.onsuccess = () => {
      this.db = request.result;
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores for different data types
      if (!db.objectStoreNames.contains('tradingLogs')) {
        db.createObjectStore('tradingLogs', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('profitBookings')) {
        db.createObjectStore('profitBookings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('masterData')) {
        db.createObjectStore('masterData', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('activeTrades')) {
        db.createObjectStore('activeTrades', { keyPath: 'key' });
      }
    };
  }

  private waitForDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const checkInterval = setInterval(() => {
        if (this.db) {
          clearInterval(checkInterval);
          resolve(this.db);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Database initialization timeout'));
      }, 5000);
    });
  }

  /**
   * Get data from cache
   */
  get<T>(storeName: string, key: string, maxAge: number = this.CACHE_DURATION): Observable<T | null> {
    return from(this.waitForDB()).pipe(
      switchMap((db) => {
        return new Promise<T | null>((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);

          request.onsuccess = () => {
            const entry: CacheEntry<T> | undefined = request.result;
            if (!entry) {
              resolve(null);
              return;
            }

            const now = Date.now();
            if (now > entry.expiresAt) {
              // Cache expired, remove it
              this.remove(storeName, key).subscribe();
              resolve(null);
              return;
            }

            resolve(entry.data);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      }),
      catchError(() => {
        // Fallback to null if IndexedDB fails
        return of(null);
      })
    );
  }

  /**
   * Set data in cache
   */
  set<T>(storeName: string, key: string, data: T, maxAge: number = this.CACHE_DURATION): Observable<boolean> {
    return from(this.waitForDB()).pipe(
      switchMap((db) => {
        return new Promise<boolean>((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const now = Date.now();

          const entry: CacheEntry<T> = {
            data,
            timestamp: now,
            expiresAt: now + maxAge,
          };

          const request = store.put({ key, ...entry });

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      }),
      catchError(() => {
        // Silently fail if IndexedDB is not available
        return of(false);
      })
    );
  }

  /**
   * Remove data from cache
   */
  remove(storeName: string, key: string): Observable<boolean> {
    return from(this.waitForDB()).pipe(
      switchMap((db) => {
        return new Promise<boolean>((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(key);

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Clear all data from a store
   */
  clearStore(storeName: string): Observable<boolean> {
    return from(this.waitForDB()).pipe(
      switchMap((db) => {
        return new Promise<boolean>((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Clear all cache
   */
  clearAll(): Observable<boolean> {
    return from(this.waitForDB()).pipe(
      switchMap((db) => {
        return new Promise<boolean>((resolve, reject) => {
          const storeNames = ['tradingLogs', 'profitBookings', 'masterData', 'activeTrades'];
          const transactions = storeNames.map(name => db.transaction([name], 'readwrite'));
          let completed = 0;
          let hasError = false;

          transactions.forEach((transaction, index) => {
            const store = transaction.objectStore(storeNames[index]);
            const request = store.clear();

            request.onsuccess = () => {
              completed++;
              if (completed === storeNames.length && !hasError) {
                resolve(true);
              }
            };

            request.onerror = () => {
              hasError = true;
              reject(request.error);
            };
          });
        });
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Invalidate cache for specific keys
   */
  invalidate(storeName: string, keys: string[]): Observable<boolean> {
    const removeObservables = keys.map(key => this.remove(storeName, key));
    return from(Promise.all(removeObservables.map(obs => obs.toPromise()))).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
