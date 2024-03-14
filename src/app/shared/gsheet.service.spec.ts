import { TestBed } from '@angular/core/testing';

import { GoogleSheetsService } from './gsheet.service';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleSheetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
