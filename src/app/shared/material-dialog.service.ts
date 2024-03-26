import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(component: any, config?: MatDialogConfig): MatDialogRef<any> {
    const dialogConfig: MatDialogConfig = {
      ...config
    };

    return this.dialog.open(component, dialogConfig);
  }

  openConfirmDialog(config?: MatDialogConfig): MatDialogRef<any> {
    const dialogConfig: MatDialogConfig = {
      width: '300px',
      ...config
    };

    return this.dialog.open(CustomDialogComponent, dialogConfig);
  }

  openCustomDialog(component: any, data?: any, config?: MatDialogConfig): MatDialogRef<any> {
    const dialogConfig: MatDialogConfig = {
      ...config,
      data
    };

    return this.dialog.open(component, dialogConfig);
  }
}
