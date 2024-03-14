import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ThemeService } from '../../services/theme.service';
import { Option } from '../../interfaces/option.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  @Input()
  options: Array<Option> | null = [];
  @Output() themeChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private themeService: ThemeService) {}

  changeTheme(themeToSet: string | undefined) {
    this.themeChange.emit(themeToSet);
  }
}
