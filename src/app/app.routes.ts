import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AssignmentsMenuComponent } from './assignments-menu/assignments-menu.component';
import { VulnFeedEffects } from './assignments-menu/assignments/vuln-feed/vuln-feed-state/vuln-feed.effects';
import { vulnFeedReducer } from './assignments-menu/assignments/vuln-feed/vuln-feed-state/vuln-feed.reducer';
import { VulnFeedFeatureKey } from './assignments-menu/assignments/vuln-feed/vuln-feed-state/vuln-feed.state';

export const routes: Routes = [
  { path: 'main-page', component: AssignmentsMenuComponent },
  {
    path: 'tree-chart',
    loadComponent: () =>
      import(
        './assignments-menu/assignments/d3-charts/tree-chart/tree-chart.component'
      ).then((m) => m.TreeChartComponent),
  },
  {
    path: 'vuln-cards',
    loadComponent: () =>
      import('./assignments-menu/assignments/vuln-cards/vuln-cards.component').then(
        (m) => m.VulnCardsComponent,
      ),
  },
  {
    path: 'vuln-feed',
    loadComponent: () =>
      import('./assignments-menu/assignments/vuln-feed/vuln-feed.component').then(
        (m) => m.VulnFeedComponent,
      ),
    providers: [
      provideState(VulnFeedFeatureKey, vulnFeedReducer),
      provideEffects(VulnFeedEffects),
    ],
  },

  { path: '', component: AssignmentsMenuComponent },
  { path: '**', component: AssignmentsMenuComponent },
];
