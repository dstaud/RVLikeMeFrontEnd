import { TestBed } from '@angular/core/testing';

import { SigninTriggeredService } from './signin-dialog-triggered.service';

describe('SigninTriggeredService', () => {
  let service: SigninTriggeredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SigninTriggeredService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
