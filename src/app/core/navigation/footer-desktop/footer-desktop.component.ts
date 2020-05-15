import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { TermsDialogComponent } from '@dialogs/terms-dialog/terms-dialog.component';
import { PrivacyPolicyDialogComponent } from '@dialogs/privacy-policy-dialog/privacy-policy-dialog.component';

@Component({
  selector: 'app-rvlm-footer-desktop',
  templateUrl: './footer-desktop.component.html',
  styleUrls: ['./footer-desktop.component.scss']
})
export class FooterDesktopComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {}

  onDocument(document) {
    if (document === 'privacy') {
        this.openPrivacyPolicyDialog(true, (result: string) => {
          // No actions at this time
        });
    } else if (document === 'terms') {
        this.openTermsOfServiceDialog(true, (result: string) => {
          // No actions at this time
        });
    }
  }


  private openPrivacyPolicyDialog(containerDialog, cb: CallableFunction): void {
    const dialogRef = this.dialog.open(PrivacyPolicyDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      data: {containerDialog: true}
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }


  private openTermsOfServiceDialog(containerDialog, cb: CallableFunction): void {
    const dialogRef = this.dialog.open(TermsDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      data: {containerDialog: true}
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }
}
