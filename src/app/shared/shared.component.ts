import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit {

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  openSnackBar(message: string, msgType: string): void {
    // Messages to user via a toast or 'snack bar' slide down.   Errors will be in red.
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    if (msgType === 'error') {
      config.panelClass = 'snackBarPanelError';
    } else {
      config.panelClass = 'snackBarPanelMessage';
    }
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this.snackBar.open(message, '', config);
  }

}
