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
  ],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },

    // Moment can be provided globally to your app by adding `provideMomentDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideMomentDateAdapter(),
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
  availableCategories: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private trackerService: TrackerService
  ) {
    this.transactionForm = this.fb.group({
      amount: [null, Validators.required],
      category: ['', Validators.required],
      note: '',
      date: [new Date(), Validators.required],
      paymentMethod: [this.paymentMethods[0], Validators.required],
      paidBy: [this.payees[0], Validators.required],
    });
  }
  ngOnInit(): void {
    this.trackerService.allCategories.subscribe((data) => {
      console.log(data);
      this.availableCategories = data.map((el) => el.name);
    });
  }

  categorySelected($event: any) {
    throw new Error('Method not implemented.');
  }
  onSubmit() {
    throw new Error('Method not implemented.');
  }

  goBack() {
    this.router.navigate(['../transaction-list'], { relativeTo: this.route });
  }
}
