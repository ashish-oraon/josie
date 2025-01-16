import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { IPieChartData } from '../monthly-transaction-report.component';
import { environment } from '../../../environments/environment';

const CURRENCY_SYMBOL = environment.currencySymbol;
@Component({
  selector: 'tracker-pie-chart',
  standalone: true,
  imports: [NgxChartsModule, CommonModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})

export class PieChartComponent {
  @Input() chartData: IPieChartData[] = [];
  single: any[] = [];
  view: [number, number] = [window.innerWidth * 0.8, window.innerHeight * 0.4];

  // options
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  showAnimations: boolean = true;
  isDoughnut: boolean = false;
  explodeSlices: boolean = false;
  legendPosition: LegendPosition = LegendPosition.Below;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
  tooltipText: Function = function name($event: any) {
    return `
      ${CURRENCY_SYMBOL}${
      Math.round(($event.value + Number.EPSILON) * 100) / 100
    }`;
  };

  constructor() {
    // Object.assign(this, { single: this.chartData });
  }

  onSelect(data: any): void {
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  onResize(event: any) {
    this.view = [window.innerWidth * 0.8, window.innerHeight * 0.4];
  }
}
