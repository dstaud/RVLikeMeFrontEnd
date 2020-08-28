import { trigger, animate, transition, style, query, state } from '@angular/animations';

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
  state('in', style({ opacity: 1 })),
  state('out', style({ opacity: 0 })),
  transition('in => out', animate('0.5s')),
  transition('out => in', animate('0.5s'))
]);

export const outAnimation = trigger('outAnimation', [
  state('in', style({ opacity: 1 })),
  state('out', style({ opacity: 0 })),
  transition('in => out', animate('3s')),
  transition('out => in', animate('3s'))
]);

