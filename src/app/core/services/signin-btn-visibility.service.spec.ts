import { TestBed } from '@angular/core/testing';

import { SigninButtonVisibleService } from './signin-btn-visibility.service';

describe('SigninVisibilityService', () => {
  let service: SigninButtonVisibleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SigninButtonVisibleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
