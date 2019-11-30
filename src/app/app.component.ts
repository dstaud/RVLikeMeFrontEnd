import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'RV Like Me';
  isDarkTheme: Observable<boolean>;

  constructor(public translate: TranslateService,
              private themeService: ThemeService) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkTheme;
  }
}
