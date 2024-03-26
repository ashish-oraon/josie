import { TestBed } from '@angular/core/testing';

import { MaterialDialogService } from './material-dialog.service';

describe('MaterialDialogService', () => {
  let service: MaterialDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
