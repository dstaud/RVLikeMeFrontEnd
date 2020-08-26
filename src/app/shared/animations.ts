import { trigger, animate, transition, style, query } from '@angular/animations';

// For fade route animation on main modules.  Also see router-outlet style in styles.scss and trigger in app.component.html/ts
export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [style({
        opacity: 0,
        position: 'absolute',
        left: 0,
        width: '100%'
      })],
      { optional: true }
    ),
    query(
      ':leave',
      [style({
        opacity: 1,
        position: 'absolute',
        left: 0,
        width: '100%'
       }), animate('0.3s', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [style({ opacity: 0,
        position: 'absolute',
        left: 0,
        width: '100%'
       }), animate('0.3s', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);

export const inOutAnimation = trigger('inOutAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [style({
        opacity: 0
      })],
      { optional: true }
    ),
    query(
      ':leave',
      [style({
        opacity: 1
      }), animate('3.3s', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [style({
        opacity: 0
      }), animate('3.3s', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);

