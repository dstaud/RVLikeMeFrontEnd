import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordVerifyComponent } from './password-verify.component';

describe('PasswordVerifyComponent', () => {
  let component: PasswordVerifyComponent;
  let fixture: ComponentFixture<PasswordVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Password Validation', () => {
    it('should detect when password length = 8', () => {
      component.onPasswordChange('12345678');

      expect(component.passwordLength).toBeTruthy();
    });

    it('should detect when password length > 8', () => {
      component.onPasswordChange('123456789');

      expect(component.passwordLength).toBeTruthy();
    });

    it('should detect when password contains an upper case letter', () => {
      component.onPasswordChange('aaaBaaa');

      expect(component.passwordUpper).toBeTruthy();
    });

    it('should detect when password contains an lower case letter', () => {
      component.onPasswordChange('aaaBaaa');

      expect(component.passwordLower).toBeTruthy();
    });

    it('should detect when password contains a number', () => {
      component.onPasswordChange('aaaB1aaa');

      expect(component.passwordNumber).toBeTruthy();
    });

    it('should detect when password contains a !', () => {
      component.onPasswordChange('aaaB!aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a @', () => {
      component.onPasswordChange('aaaB@aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a #', () => {
      component.onPasswordChange('aaaB#aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a $', () => {
      component.onPasswordChange('aaaB$aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a %', () => {
      component.onPasswordChange('aaaB%aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a &', () => {
      component.onPasswordChange('aaaB&aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a *', () => {
      component.onPasswordChange('aaaB*aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should detect when password contains a ^', () => {
      component.onPasswordChange('aaaB^aaa');

      expect(component.passwordSpecial).toBeTruthy();
    });

    it('should ignore if password contains other special characters', () => {
      component.onPasswordChange('aaaB`()+-aaa');

      expect(component.passwordSpecial).toBeFalsy();
    });
  });
});
