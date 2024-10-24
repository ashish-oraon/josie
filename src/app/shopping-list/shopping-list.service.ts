import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { GoogleSheetService } from '../gsheet.service';
const data = [
  {
    id: 2,
    name: 'Bhindi',
    quantity: 5,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 3,
    name: 'Potato 🥔',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 4,
    name: 'Onion 🧅 ',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 5,
    name: 'Pizza',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 6,
    name: 'Chicken ministeak🍗 ',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 7,
    name: 'Mushroom 🍄🍄',
    quantity: 4,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 8,
    name: 'Mustard oil 🛢️',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 9,
    name: 'Banana 🍌',
    quantity: 4,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 10,
    name: 'Muri',
    quantity: 5,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 11,
    name: 'Paneer',
    quantity: 8,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 12,
    name: 'Green Chilly',
    quantity: 6,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 13,
    name: 'Muffin 🧁',
    quantity: 14,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 14,
    name: 'Ginger garlic paste ',
    quantity: 54,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 15,
    name: 'Yogurt ',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 16,
    name: 'Maggie',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 17,
    name: 'Chaat Masala ',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 18,
    name: 'Pav bhaji masala',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 19,
    name: 'Milk',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 20,
    name: 'Cornflakes',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 21,
    name: 'Nuts',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 22,
    name: 'Corn',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 23,
    name: 'Prawns 🍤 ',
    quantity: 5,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 24,
    name: 'Powder Zucker ',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 25,
    name: 'Madeline🥮',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 26,
    name: 'Garbage bag',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 27,
    name: 'Tomato 🍅',
    quantity: '',
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 28,
    name: 'Waffle',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 29,
    name: 'Jackfruit ',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 30,
    name: 'Room freshner',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 31,
    name: 'Pangasius Fillet 🐟 ',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 32,
    name: 'Honey 🍯',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 33,
    name: 'Mozerela',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 34,
    name: 'Zucchini ',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 35,
    name: 'Chocolate ',
    quantity: 2,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 36,
    name: 'Rice',
    quantity: 6,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 37,
    name: 'Sanitary Napkin',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 38,
    name: 'American Cookie 🍪',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 39,
    name: 'Chips',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 40,
    name: 'Handwash bottle 🧴',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 41,
    name: 'Salt',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 42,
    name: 'Eggs',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 43,
    name: 'yoyo',
    quantity: 3,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 44,
    name: 'Avocado 🥑 ',
    quantity: 2,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 45,
    name: 'Lachsfillet',
    quantity: 2,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 46,
    name: 'Ja Tomato Ketchup',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 47,
    name: 'Remoulade',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 48,
    name: 'Ginger 🫚',
    quantity: '',
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 49,
    name: 'Cauliflower ',
    quantity: '',
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 50,
    name: 'garlic 🧄',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 51,
    name: 'Bell paper 🫑',
    quantity: 3,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 52,
    name: 'Couscous ',
    quantity: 1,
    isAdded: false,
    isDeleted: false,
  },
  {
    id: 53,
    name: 'Ja mozzarella 🧀',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 54,
    name: 'Eggs',
    quantity: 10,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 55,
    name: 'Tomato sauce ',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 56,
    name: 'Black pepper',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 57,
    name: 'Vollkorn toast 🍞',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 58,
    name: 'Nudeln 🍝',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 59,
    name: 'Carrot 🥕',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 60,
    name: 'Lime 🍋',
    quantity: '',
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 61,
    name: 'Coriander ☘️',
    quantity: '',
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 62,
    name: 'Ula 🫒',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
  {
    id: 63,
    name: 'Okra 👱‍♀️💅',
    quantity: 1,
    isAdded: true,
    isDeleted: false,
  },
];
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

          return arr.filter((el) => !el.isDeleted);
        })
      );
  }

  update(item: any) {
    return this.googleSheetsService.updateData(item, 0, 'shoppingList');
  }
}
