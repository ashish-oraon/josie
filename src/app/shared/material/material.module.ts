import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

const modules = [
  CommonModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatInputModule,
  MatSelectModule,
  MatFormFieldModule,
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatListModule,
  MatTabsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  DragDropModule,
  MatExpansionModule,
  MatDialogModule,
  MatMenuModule,
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class MaterialModule {}
