import { TestBed } from '@angular/core/testing';

import { SigninVisibilityService } from './signin-visibility.service';

describe('SigninVisibilityService', () => {
  let service: SigninVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SigninVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
