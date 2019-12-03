import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FooterComponent } from './navigation/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'RV Like Me';

  constructor(public translate: TranslateService) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
  }
}
