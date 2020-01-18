import { TestBed } from '@angular/core/testing';

import { RegisterBtnVisibleService } from './register-btn-visiblity.service';

describe('RegisterVisibleService', () => {
  let service: RegisterBtnVisibleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterBtnVisibleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
