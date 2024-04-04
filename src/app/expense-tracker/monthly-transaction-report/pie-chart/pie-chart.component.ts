import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgxChartsModule, Color, LegendPosition } from '@swimlane/ngx-charts';
import { IPieChartData } from '../monthly-transaction-report.component';

const single = [
  {
    name: 'Germany',
    value: 8940000,
  },
  {
    name: 'USA',
    value: 5000000,
  },
  {
    name: 'France',
    value: 7200000,
  },
  {
    name: 'UK',
    value: 6200000,
  },
];
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
  legendPosition: LegendPosition = LegendPosition.Below;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor() {
    // Object.assign(this, { single: this.chartData });
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  onResize(event: any) {
    this.view = [window.innerWidth * 0.8, window.innerHeight * 0.4];
  }
}
