import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { VulnFeedService } from '../vuln-feed.service';
import { vulnFeedActions } from './vuln-feed.actions';

@Injectable()
export class VulnFeedEffects {
  private actions$ = inject(Actions);
  private vulnFeedService = inject(VulnFeedService);

  getVulns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(vulnFeedActions.getVulnsAction),
      switchMap(() =>
        this.vulnFeedService.getVulns().pipe(
          map((vulns) => vulnFeedActions.getVulnsActionSuccess({ vulns })),
          catchError((error: Error) =>
            of(vulnFeedActions.getVulnsActionFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
