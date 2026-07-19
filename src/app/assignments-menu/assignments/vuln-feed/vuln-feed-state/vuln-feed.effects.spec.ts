import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, ReplaySubject, of, throwError } from 'rxjs';
import { VulnFeedItem } from '../vuln-feed-models';
import { VulnFeedService } from '../vuln-feed.service';
import { vulnFeedActions } from './vuln-feed.actions';
import { VulnFeedEffects } from './vuln-feed.effects';

describe('VulnFeedEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: VulnFeedEffects;
  let service: jasmine.SpyObj<VulnFeedService>;

  beforeEach(() => {
    actions$ = new ReplaySubject<unknown>(1);
    service = jasmine.createSpyObj<VulnFeedService>('VulnFeedService', [
      'getVulns',
    ]);

    TestBed.configureTestingModule({
      providers: [
        VulnFeedEffects,
        provideMockActions(() => actions$ as unknown as Observable<unknown>),
        { provide: VulnFeedService, useValue: service },
      ],
    });

    effects = TestBed.inject(VulnFeedEffects);
  });

  it('maps a successful load to getVulnsActionSuccess', () => {
    const vulns: VulnFeedItem[] = [];
    service.getVulns.and.returnValue(of(vulns));

    const emitted: unknown[] = [];
    effects.getVulns$.subscribe((action) => emitted.push(action));
    actions$.next(vulnFeedActions.getVulnsAction());

    expect(emitted).toEqual([vulnFeedActions.getVulnsActionSuccess({ vulns })]);
  });

  it('maps a failed load to getVulnsActionFailure with the message', () => {
    service.getVulns.and.returnValue(throwError(() => new Error('boom')));

    const emitted: unknown[] = [];
    effects.getVulns$.subscribe((action) => emitted.push(action));
    actions$.next(vulnFeedActions.getVulnsAction());

    expect(emitted).toEqual([
      vulnFeedActions.getVulnsActionFailure({ error: 'boom' }),
    ]);
  });

  it('keeps serving requests after a failure (bug #5 regression)', () => {
    // First request errors, the next one succeeds. If catchError were on the
    // outer stream, the effect would complete after the error and never emit again.
    service.getVulns.and.returnValues(
      throwError(() => new Error('boom')),
      of([]),
    );

    const types: string[] = [];
    effects.getVulns$.subscribe((action) => types.push((action as { type: string }).type));
    actions$.next(vulnFeedActions.getVulnsAction());
    actions$.next(vulnFeedActions.getVulnsAction());

    expect(types).toEqual([
      vulnFeedActions.getVulnsActionFailure.type,
      vulnFeedActions.getVulnsActionSuccess.type,
    ]);
  });
});
