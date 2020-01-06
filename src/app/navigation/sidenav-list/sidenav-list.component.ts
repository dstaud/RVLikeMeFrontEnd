import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from './../../core/services/data.service';
import { UserAuthService } from './../../core/services/user-auth.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();

  constructor(private dataSvc: DataService,
              private userAuthService: UserAuthService) { }

  ngOnInit() {
  }

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  }

  public logout() {
    this.userAuthService.userAuthorized(false);
    this.sidenavClose.emit();
    this.dataSvc.logout();
  }
}
