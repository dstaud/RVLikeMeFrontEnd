import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-password-verify',
  templateUrl: './password-verify.component.html',
  styleUrls: ['./password-verify.component.scss']
})
export class PasswordVerifyComponent implements OnInit {
  @Input() passwordLength: boolean;
  @Input() passwordUpper: boolean;
  @Input() passwordLower: boolean;
  @Input() passwordNumber: boolean;
  @Input() passwordSpecial: boolean;

  private regUpper = /^(?=.*[A-Z])/;
  private regLower = /^(?=.*[a-z])/;
  private regNumber = /^(?=.*[0-9])/;
  private regSpecial = /^(?=.*[!@#\$%\^&\*])/;

  constructor() { }

  ngOnInit(): void {
  }

  onPasswordChange(password: string) {
    if (password.length >= 8) {
      this.passwordLength = true;
    } else {
      this.passwordLength = false;
    }

    this.passwordUpper = this.regUpper.test(password);
    this.passwordLower = this.regLower.test(password);
    this.passwordNumber = this.regNumber.test(password);
    this.passwordSpecial = this.regSpecial.test(password);
  }
}
