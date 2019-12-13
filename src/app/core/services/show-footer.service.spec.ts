import { TestBed } from '@angular/core/testing';

import { ShowFooterService } from './show-footer.service';

describe('ShowFooterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShowFooterService = TestBed.get(ShowFooterService);
    expect(service).toBeTruthy();
  });
});
