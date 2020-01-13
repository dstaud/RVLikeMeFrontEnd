import { TestBed } from '@angular/core/testing';

import { RegisterTriggeredService } from './register-dialog-triggered.service';

describe('RegisterTriggeredService', () => {
  let service: RegisterTriggeredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterTriggeredService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
