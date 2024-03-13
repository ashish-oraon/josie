import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTransactionReportComponent } from './monthly-transaction-report.component';

describe('MonthlyTransactionReportComponent', () => {
  let component: MonthlyTransactionReportComponent;
  let fixture: ComponentFixture<MonthlyTransactionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTransactionReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthlyTransactionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
