import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { isNumber } from 'util';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ThemeService } from '@services/theme.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})

export class SharedComponent implements OnInit {
  private theme: string;

  constructor(private snackBar: MatSnackBar,
              private themeSvc: ThemeService,
              private sentry: SentryMonitorService) { }

  ngOnInit() {
    this.listenForColorTheme();
  }

  ngOnDestroy() {}

  openSnackBar(message: string, msgType: string, duration?: number): void {
    // Messages to user via a toast or 'snack bar' slide down.   Errors will be in red.
    const config = new MatSnackBarConfig();
    config.duration = 5000;

    if (duration) {
      if (isNumber(duration)) {
        config.duration = duration;
      }
    }
    if (msgType === 'error') {
      if (this.theme === 'dark-teme') {
        config.panelClass = ['snackBarPanelErrorDarkTheme'];
      } else {
        config.panelClass = ['snackBarPanelErrorLightTheme'];
      }
    } else {
      if (this.theme === 'dark-theme') {
        config.panelClass = ['snackBarPanelMessageDarkTheme'];
      } else {
        config.panelClass = ['snackBarPanelMessageLightTheme'];
      }

    }
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this.snackBar.open(message, '', config);
  }

  public notifyUserMajorError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    // If this is a problem lazy-loading the module, then force a reload
    if (chunkFailedMessage.test(error.message)) {
      this.openSnackBar('Oops.  Sorry, but we seem to be having an issue and need to reload the page in 3 seconds','error', 3000);
      this.sentry.logError('Got a chunk error and reloaded page');

      setTimeout(function () {
        window.location.reload();
      }, 3000);

    } else {
      this.openSnackBar('Oops.  Sorry, but we seem to be having an issue.  The administrator has been notified, but please check your internet connection and try again.','error', 5000);
    }
  }

  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError({"message":"unable to listen for color theme","error":error});
    });
  }

}
