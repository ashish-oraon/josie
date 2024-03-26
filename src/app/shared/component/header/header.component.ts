import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { Option } from '../../interfaces/option.model';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  options$: Observable<Array<Option>> = this.themeService.getThemeOptions();

  constructor(
    private readonly themeService: ThemeService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit() {
    const themeToSet = this.localStorage.getItem('theme');
    if (themeToSet) {
      this.themeService.setTheme(themeToSet);
    } else {
      this.themeService.setTheme('deeppurple-amber');
    }
  }

  themeChangeHandler(themeToSet: any) {
    this.themeService.setTheme(themeToSet);
  }
}
