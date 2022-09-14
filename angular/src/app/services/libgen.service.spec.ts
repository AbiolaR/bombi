import { TestBed } from '@angular/core/testing';

import { LibgenService } from './libgen.service';

describe('LibgenService', () => {
  let service: LibgenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibgenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
