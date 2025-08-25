import { Component, Input } from '@angular/core';
import { NgxChartsModule, Color, LegendPosition } from '@swimlane/ngx-charts';
import { IPieChartData } from '../monthly-transaction-report.component';
import { environment } from '../../../environments/environment';

import { logger } from '../../../shared/utils/logger.util';
const CURRENCY_SYMBOL = environment.currencySymbol;
@Component({
  selector: 'tracker-line-chart',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
  @Input() chartData: IPieChartData[] = [];
  single: any[] = [];
  view: [number, number] = [300, 300];

  // options
  gradient: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  showAnimations: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: LegendPosition = LegendPosition.Right;
  showXAxisLabel = true;
  xAxisLabel = 'Category';
  showYAxisLabel = true;
  yAxisLabel = 'Amount';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor() {
    // Object.assign(this, { single: this.chartData });
  }

  onSelect(data: any): void {
    // logger.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    // logger.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    // logger.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  onResize(event: any) {
    // this.view = [event.target.innerWidth / 3, event.target.innerHeight];
  }

  formatDataLabel(value: any) {
    return `
      ${CURRENCY_SYMBOL}${Math.round((value + Number.EPSILON) * 100) / 100}`;
  }
}
