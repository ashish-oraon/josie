import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  inject,
} from '@angular/core';
import { ITransaction } from '../../../interfaces/transaction';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';

import { MatIconModule } from '@angular/material/icon';
import { FlatTreeControl } from '@angular/cdk/tree';

import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CdkDrag, CdkDragExit, DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { CommonService } from '../../../../shared/common.service';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { TrackerService } from '../../../services/tracker.service';
import { HighlightDirective } from '../../../../shared/highlight.directive';
import { TransactionDetailsModalComponent } from '../../transaction-details-modal/transaction-details-modal.component';

interface ITransactionNode {
  transaction: any;
  children?: ITransactionNode[];
}

export interface Section {
  name: string;
  updated: Date;
}
export interface Unit {
  name: string;
  cityName: string;
  photoUrl: string;
  usersCount: string;
  ceo?: string;
}

interface ExampleFlatNode {
  expandable: boolean;
  transaction: any;
  level: number;
}
@Component({
  selector: 'tracker-day-card',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    DragDropModule,
    MatCardModule,
    HighlightDirective,
    OverlayModule,
  ],
  templateUrl: './day-card.component.html',
  styleUrl: './day-card.component.scss',
})
export class DayCardComponent implements OnChanges {
  clickHandler(eb: any) {
  }
  @ViewChildren(CdkDrag) dragItems!: QueryList<CdkDrag>;

  draggedItemIndex: number = -1;

  onItemEntered(event: any) {
    // this.draggedItemIndex = this.dragItems.indexOf(event.item.data);
    this.resetDraggedItemPosition();
  }

  private resetDraggedItemPosition() {
    const draggedItem: any = document.querySelector('.cdk-drag-dragging');
    const otherItems: any = document.querySelectorAll(
      '.cdk-drag:not(.cdk-drag-dragging)'
    );

    if (draggedItem) {
      draggedItem['style'].transform = 'translate3d(20px, 0, 0)';
    }

    otherItems.forEach((item: { style: { transform: string } }) => {
      item.style.transform = 'none';
    });
  }

  onItemExited(event: CdkDragExit<string[]>) {
    this.draggedItemIndex = -1;
  }

  onDrop(event: any) {
    // Retrieve the updated items array after the drop
    this.dragItems = event.container.data;
  }

  @Input()
  date!: string;
  @Input()
  transactions: ITransaction[] | undefined;
  @Output() dayEvent = new EventEmitter<any>();

  isOpen: boolean = false;
  commonService: CommonService = inject(CommonService);

  totalEstimate = 10;
  ctx = { estimate: this.totalEstimate };
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: ITransactionNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      transaction: node.transaction,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  headerObj!: { date: number; month: string; year: number };
  totalOfTheDay: number = 0;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private trackerService: TrackerService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.prepareHeader();
    const mapp: Map<string, any> = new Map<string, any>();
    if (this.transactions) {
      this.totalOfTheDay = 0; // Reset total
      for (let t of [...this.transactions]) {
        this.totalOfTheDay += t.amount;
        if (mapp.has(t.category)) {
          const { children, transaction } = mapp.get(t.category);
          children.push({ transaction: { ...t } });
          transaction.amount += t.amount;
        } else {
          let newObj = {
            transaction: { ...t },
            children: [{ transaction: { ...t } }],
          };
          mapp.set(t.category, newObj);
        }
      }

      this.dataSource.data = [...mapp.values()];
    }
  }

  prepareHeader() {
    const cardDate: Date = this.date ? new Date(this.date) : new Date();
    const [month, date, year] = [
      this.commonService.monthNameMap[cardDate.getMonth()],
      cardDate.getDate(),
      cardDate.getFullYear(),
    ];
    this.headerObj = { date, month, year };
  }

  /* dasjdljas */
  doAction(arg0: { type: string; transaction: any }) {
    throw new Error('Method not implemented.');
  }

  viewTransactionDetails(transaction: ITransaction) {
    const dialogRef = this.dialog.open(TransactionDetailsModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { transaction },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (result.action) {
          case 'updated':
            // Refresh the transaction list
            this.dayEvent.emit({ action: 'refresh' });
            break;
          case 'deleted':
            // Refresh the transaction list
            this.dayEvent.emit({ action: 'refresh' });
            break;
        }
      }
    });
  }

  editTransaction(transaction: ITransaction | undefined) {
    this.router.navigate(['../add-transaction'], {
      relativeTo: this.route,
      state: { transaction, action: 'edit' },
    });
  }

  deleteTransaction(transaction: ITransaction) {
    this.dayEvent.emit({
      action: 'delete',
      data: { transaction },
    });

    // this.trackerService
    //   .deleteTransaction(transaction, transaction.id)
    //   .subscribe(
    //     (data) => {},
    //     () => {},
    //     () => {}
    //   );
  }
}
