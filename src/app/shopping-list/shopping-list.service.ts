import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GoogleSheetService } from '../gsheet.service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  
  allShoppingItems$: Observable<any[]>;
  constructor(private googleSheetsService: GoogleSheetService) {
    this.allShoppingItems$ = this.googleSheetsService
      .readData('readShoppingList')
      .pipe(
        map((arr: any[]) => {
          arr.shift();
          return arr
            .filter((el) => !el.isDeleted);
        })
      );
  }

  update(item: any) {
    return this.googleSheetsService.updateData(item, 0, 'shoppingList');
  }
}
