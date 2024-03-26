import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, of, shareReplay, tap } from 'rxjs';
import { GoogleSheetService } from '../gsheet.service';
import { ICategory } from '../expense-tracker/interfaces/category';
const staticData = [
  {
    id: 2,
    name: 'conveyance',
    icon: 'directions_transit',
    type: 'expense',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 3,
    name: 'recreation',
    icon: 'videogame_asset',
    type: 'expense',
    subType: 'wants',
    isDeleted: false,
  },
  {
    id: 4,
    name: 'travel',
    icon: 'beach_access',
    type: 'expense',
    subType: 'wants',
    isDeleted: false,
  },
  {
    id: 5,
    name: 'takeaway',
    icon: 'fastfood',
    type: 'expense',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 6,
    name: 'shopping',
    icon: 'shopping_cart',
    type: 'expense',
    subType: 'wants',
    isDeleted: false,
  },
  {
    id: 7,
    name: 'grocery',
    icon: 'local_convenience_store',
    type: 'expense',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 8,
    name: 'personal care',
    icon: 'face_retouching_natural',
    type: 'expense',
    subType: 'wants',
    isDeleted: false,
  },
  {
    id: 9,
    name: 'eat out',
    icon: 'local_dining',
    type: 'expense',
    subType: 'wants',
    isDeleted: false,
  },
  {
    id: 10,
    name: 'drinks',
    icon: 'local_drink',
    type: 'expense',
    subType: 'wants',
    isDeleted: false,
  },
  {
    id: 11,
    name: 'rent',
    icon: 'house',
    type: 'expense',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 12,
    name: 'loan',
    icon: 'money',
    type: 'expense',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 13,
    name: 'salary',
    icon: 'monetization_on',
    type: 'income',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 14,
    name: 'utility',
    icon: 'electrical_services',
    type: 'expense',
    subType: 'needs',
    isDeleted: false,
  },
  {
    id: 15,
    name: 'investment ',
    icon: 'money',
    type: 'expense',
    subType: 'investment ',
    isDeleted: false,
  },
];
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  allCategories$: Observable<ICategory[]>;
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
    this.allCategories$ = of(staticData).pipe(shareReplay(1));
    // this.allCategories$ = this.googleSheetsService
    //   .readData('readCategories')
    //   .pipe(
    //     map((arr: any[]) => {
    //       arr.shift();
    //       return arr.map(([id, name, icon, type, subType, isDeleted]) => ({
    //         id,
    //         name,
    //         icon,
    //         type,
    //         subType,
    //         isDeleted,
    //       }));
    //     }),
    //     shareReplay(1)
    //   );
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
