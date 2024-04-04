import { Component, Inject, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingListService } from './shopping-list.service';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

export interface IShoppingItem {
  id: number;
  name: string;
  quantity?: string;
  isAdded?: boolean;
  isDeleted?: boolean;
}
@Component({
  selector: 'app-shopping-list',
  standalone: true,

  imports: [
    CdkDropList,
    CdkDrag,
    MatFormFieldModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatBadgeModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent implements OnInit {
  canShowSpinner: boolean = false;
  isLoading: boolean = false;
  dataToBeAdded!: IShoppingItem;
  unsavedChangesExist: boolean = false;

  constructor(
    private shoppingListService: ShoppingListService,
    public dialog: MatDialog
  ) {}
  shoppingItems: IShoppingItem[] = [];
  inCart: IShoppingItem[] = [];
  rest: IShoppingItem[] = [];
  ngOnInit(): void {
    this.getTheData();
    this.initAreas();
  }

  initAreas() {
    this.inCart = this.shoppingItems.filter((el) => el.isAdded);
    this.rest = this.shoppingItems.filter((el) => !el.isAdded);
  }

  drop(event: CdkDragDrop<IShoppingItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      this.unsavedChangesExist = true;
      const selectedItem = event.item.data;
      selectedItem.isAdded = event.previousContainer.id === 'cdk-drop-list-1';

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getTheData() {
    this.shoppingListService.allShoppingItems$.subscribe((data) => {
      this.shoppingItems = data;
      this.initAreas();
    });
  }
  handleSave() {
    this.saveAll();
  }

  saveAll() {
    this.isLoading = true;
    this.shoppingListService.update(this.shoppingItems).subscribe(
      (data: any) => {
        console.log(data);
        alert('Saved!');
      },
      () => console.log('error occured'),
      () => {
        this.isLoading = false;
        this.unsavedChangesExist = false;
      }
    );
  }

  dblClick(item?: IShoppingItem): void {
    console.log(item);
    alert('ii');
  }
  openDialog(item?: IShoppingItem): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      data: item,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.unsavedChangesExist = true;
      console.log('The dialog was closed');
      const { name, quantity, id } = result;
      if (id) {
        const selectedItem = this.shoppingItems.find((el) => el.id === id);
        if (selectedItem) {
          selectedItem.name = name;
          selectedItem.quantity = quantity;
        }
      } else {
        this.shoppingItems.push({
          id: this.shoppingItems[this.shoppingItems.length - 1].id + 1,
          name,
          quantity,
          isAdded: true,
          isDeleted: false,
        });
      }

      this.initAreas();
    });
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'add-shopping-item.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: IShoppingItem
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
