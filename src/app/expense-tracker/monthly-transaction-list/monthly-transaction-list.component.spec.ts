import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTransactionListComponent } from './monthly-transaction-list.component';

describe('MonthlyTransactionListComponent', () => {
  let component: MonthlyTransactionListComponent;
  let fixture: ComponentFixture<MonthlyTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTransactionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthlyTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
