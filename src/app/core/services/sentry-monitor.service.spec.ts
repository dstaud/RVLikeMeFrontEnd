import { TestBed } from '@angular/core/testing';

import { SentryMonitorService } from './sentry-monitor.service';

describe('SentryMonitorService', () => {
  let service: SentryMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentryMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
