import { Component, EventEmitter, Input, output, Output } from '@angular/core';
import { IShoppingItem } from '../shopping-list.component';
import { MatCard, MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'item',
  standalone: true,
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class ItemComponent {
  @Input()
  product!: IShoppingItem;
  @Output() edit: EventEmitter<IShoppingItem> =
    new EventEmitter<IShoppingItem>();
  @Output() delete: EventEmitter<IShoppingItem> =
    new EventEmitter<IShoppingItem>();

  longText: string = 'lorelipsum';

  triggerEdit(value: IShoppingItem) {
    if (value) {
      this.edit.emit(value);
    }
  }
  triggerDelete(value: IShoppingItem) {
    if (value) {
      this.delete.emit(value);
    }
  }
  addQuantity(product: IShoppingItem) {
    product.quantity = (+product.quantity! + 1).toString();
  }
  removeQuantity(product: IShoppingItem) {
    product.quantity = (+product.quantity! - 1).toString();
    if (+product.quantity === 0) {
      this.triggerDelete(product);
    }
  }
}
