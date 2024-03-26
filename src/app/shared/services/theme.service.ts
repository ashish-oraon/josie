import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Option } from '../interfaces/option.model';
import { StyleManagerService } from './style-manager.service';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class ThemeService {
  constructor(
    private http: HttpClient,
    private styleManager: StyleManagerService,
    private localStorage: LocalStorageService
  ) {}

  getThemeOptions(): Observable<Array<Option>> {
    // return this.http.get<Array<Option>>('assets/options.json');
    return of([
      {
        backgroundColor: '#fff',
        buttonColor: '#ffc107',
        headingColor: '#673ab7',
        label: 'Deep Purple & Amber',
        value: 'deeppurple-amber',
      },
      {
        backgroundColor: '#fff',
        buttonColor: '#ff4081',
        headingColor: '#3f51b5',
        label: 'Indigo & Pink',
        value: 'indigo-pink',
      },
      {
        backgroundColor: '#303030',
        buttonColor: '#607d8b',
        headingColor: '#e91e63',
        label: 'Pink & Blue Grey',
        value: 'pink-bluegrey',
      },
      {
        backgroundColor: '#303030',
        buttonColor: '#4caf50',
        headingColor: '#9c27b0',
        label: 'Purple & Green',
        value: 'purple-green',
      },
    ]);
  }

  setTheme(themeToSet: string) {
    this.styleManager.setStyle('theme', `assets/themes/${themeToSet}.css`);
    this.localStorage.setItem('theme', themeToSet);
  }
}
