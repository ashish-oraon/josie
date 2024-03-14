import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { GoogleSheetService } from '../gsheet.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  allCategories$: any;
  monthNameMap: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  constructor(
    private googleSheetsService: GoogleSheetService,
    private _snackBar: MatSnackBar
  ) {
    this.allCategories$ = this.googleSheetsService
      .readData('readCategories')
      .pipe(
        map((arr: any[]) => {
          arr.shift();
          return arr.map(([id, name, icon, type, subType, isDeleted]) => ({
            id,
            name,
            icon,
            type,
            subType,
            isDeleted,
          }));
        }),
        shareReplay(1)
      );
  }

  parseDate(date: Date): string {
    let dt: Date = date;
    return `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  getSheetName(selectedDate: Date): string {
    return `${
      this.monthNameMap[selectedDate.getMonth()]
    }-${selectedDate.getFullYear()}`;
  }
}
