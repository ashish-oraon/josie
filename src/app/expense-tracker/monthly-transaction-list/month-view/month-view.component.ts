import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ITabInformation } from '../../interfaces/tab-info';
import { CommonModule } from '@angular/common';
import { TrackerService } from '../../services/tracker.service';
import { ITransaction } from '../../interfaces/transaction';
import { map, tap } from 'rxjs';
import { DayCardComponent } from './day-card/day-card.component';

@Component({
  selector: 'month-view',
  standalone: true,
  imports: [CommonModule, DayCardComponent],
  templateUrl: './month-view.component.html',
  styleUrl: './month-view.component.scss',
})
export class MonthViewComponent implements OnChanges {
  @Input()
  monthDetail!: ITabInformation;
  transactionsOftheMonth: ITransaction[] = [];
  datesInTheMonth: string[] = [];
  transactionMap: Map<string, ITransaction[]> = new Map<
    string,
    ITransaction[]
  >();

  // transactionsOfTheMonth =

  constructor(private trackerService: TrackerService) {}
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.monthDetail);
    const { month, year } = this.monthDetail;
    this.trackerService.allTransactionsWithCategories$
      .pipe(
        map((data) =>
          data
            .filter((el) => {
              let dataOfTr = new Date(el.date);
              return (
                month === dataOfTr.getMonth() && year == dataOfTr.getFullYear()
              );
            })
            .sort((a, b) => {
              let aDate = new Date(a.date);
              let bDate = new Date(b.date);
              return bDate.getTime() - aDate.getTime();
            })
        )
      )
      .subscribe((data) => {
        this.transactionsOftheMonth = data;
        this.processData(this.transactionsOftheMonth);
      });
  }
  processData(transactionsOftheMonth: ITransaction[]) {
    let sum: number = 0;
    let dateSet: Set<string> = new Set<string>();

    for (let tr of transactionsOftheMonth) {
      sum += +tr.amount;
      if (!dateSet.has(tr.date)) {
        dateSet.add(tr.date);
      }
      const existingTransactions = this.transactionMap.get(tr.date) || [];
      existingTransactions.push(tr);
      this.transactionMap.set(tr.date, existingTransactions);
      this.datesInTheMonth = Array.from(dateSet);
    }
  }
}
