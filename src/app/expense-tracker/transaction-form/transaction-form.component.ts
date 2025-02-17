import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { TrackerService } from '../services/tracker.service';
import { ICategory } from '../interfaces/category';
import { ITransaction } from '../interfaces/transaction';
import { LoaderService } from '../../shared/loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonService } from '../../shared/common.service';
export interface DialogData {
  type: string;
  transaction: ITransaction;
}
@Component({
  selector: 'transaction-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    CommonModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },

    // Moment can be provided globally to your app by adding `provideMomentDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideMomentDateAdapter(),
    provideNativeDateAdapter(),
  ],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})

export class TransactionFormComponent implements OnInit {
  paidBy: string | undefined;

  payees: string[] = ['Ai', 'As'];
  paymentMethods: string[] = [
    'Debit Card',
    'Credit Card',
    'Bank Transfer',
    'Cash',
  ];

  transactionForm: FormGroup<any>;
  availableCategories: ICategory[] = [];
  availableCategoriesNames: string[] = [];
  navigationExtras: any;
  selectedTransaction: any;
  formType: string = 'add';
  isLoading$: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private trackerService: TrackerService,
    private loaderService: LoaderService,
    private commonService: CommonService
  ) {
    this.isLoading$ = this.loaderService.isLoading$;
    this.navigationExtras = this.router.getCurrentNavigation()?.extras;
    this.transactionForm = this.fb.group({
      amount: [null, Validators.required],
      category: ['', Validators.required],
      note: '',
      date: [new Date(), Validators.required],
      paymentMethod: [this.paymentMethods[1], Validators.required],
      paidBy: [this.payees[0], Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.navigationExtras?.state) {
      this.selectedTransaction = this.navigationExtras.state.transaction;
      this.formType = this.navigationExtras.state.action;
    }

    this.trackerService.allCategories.subscribe((data) => {
      this.availableCategories = data;
      this.availableCategoriesNames = data.map((el) => el.name);

      if (this.selectedTransaction && this.formType !== 'add') {
        this.setFormData();
      } else {
        const defaultCategory = this.availableCategories.find(
          (cat) => cat.name === 'grocery'
        );
        this.transactionForm.patchValue({ category: defaultCategory });
      }
    });

    this.initializePayeeSelection();
  }

  initializePayeeSelection() {
    this.commonService.activeUser.subscribe((user) => {
      if (this.formType === 'add') {
        this.transactionForm.patchValue({
          paidBy: user === 'ashish' ? 'As' : 'Ai',
        });
      }
    });
  }

  setFormData() {
    const transaction = this.selectedTransaction;
    const selectedCategory = this.availableCategories.find(
      (el) => el.name === transaction.category
    );
    this.transactionForm.setValue({
      amount: transaction.amount,
      category: selectedCategory,
      note: transaction.note,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      paidBy: transaction.paidBy,
    });
  }

  categorySelected($event: any) {
    throw new Error('Method not implemented.');
  }

  onSubmit() {
    throw new Error('Method not implemented.');
  }

  doSubmit() {
    const formValue = this.transactionForm.value;
    const payload = {
      ...this.transactionForm.value,
      category: formValue.category.name,
      type: formValue.category.type,
    };
    if (this.formType === 'add') {
      this.loaderService.show();
      this.trackerService.addNewTransaction(payload).subscribe(
        (data) => {
          if (data.message === 'Transaction updated successfully') {
            this.commonService.openSnackBar(data.message, '', 3);
            this.goBack();
          }
        },
        (error) => {
          this.commonService.openSnackBar(
            'Something went wrong, Try Again!',
            '',
            3
          );
        },
        () => {
          this.loaderService.hide();
        }
      );
    } else {
      if (this.selectedTransaction) {
        this.loaderService.show();
        this.trackerService
          .updateTransaction(payload, this.selectedTransaction.id)
          .subscribe(
            (data) => {
              if (data.message === 'Transaction updated successfully') {
                this.commonService.openSnackBar('Success', data.message, 3);
                this.goBack();
              }
            },
            (error) => {
              this.commonService.openSnackBar(
                'Success',
                'Something went wrong, Try Again!',
                3
              );
            },
            () => {
              this.loaderService.hide();
            }
          );
      }
    }
  }

  goBack() {
    this.router.navigate(['/expense-tracker/transaction-list']);
  }

  onNoClick(): void {}
}
