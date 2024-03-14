import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.css'],
})
export class CustomDialogComponent {
  itemName: string = '';

  constructor(public dialogRef: MatDialogRef<CustomDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close(this.itemName);
  }
}
