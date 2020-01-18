import { TestBed } from '@angular/core/testing';

import { ActivateBackArrowService } from './activate-back-arrow.service';

describe('ActivateBackArrowService', () => {
  let service: ActivateBackArrowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivateBackArrowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
