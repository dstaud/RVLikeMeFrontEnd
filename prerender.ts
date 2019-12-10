/* though I got this from Angular documentation on 12/8/2019, it doesn't like import.
https://blog.angular-university.io/angular-universal/#:~:targetText=In%20a%20nutshell%2C%20Angular%20Universal,second%20on%20the%20client%20side.

Started changing to require, but putting app-shell on the shelf for now to let things get sorted out */
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
const {renderModuleFactory} = require ('@angular/platform-server/renderModuleFactory');
// import {renderModuleFactory} from '@angular/platform-server';
import {writeFileSync} from 'fs';

const {AppServerModuleNgFactory} = require('./dist-server/main');


renderModuleFactory(AppServerModuleNgFactory, {
    document: '<app-root></app-root>',
    url: '/'
})
.then(html => {
    console.log('Pre-rendering successful, saving prerender.html');
    writeFileSync('./prerender.html', html);
})
.catch(error => {
    console.error('Error occurred:', error);
});
