import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { generateVulnFeed } from './vuln-feed-mock-data';
import { VulnFeedItem } from './vuln-feed-models';

@Injectable({ providedIn: 'root' })
export class VulnFeedService {
  simulateError = false;

  getVulns(): Observable<VulnFeedItem[]> {
    if (this.simulateError) {
      return timer(600).pipe(
        switchMap(() =>
          throwError(
            () => new Error('Vulnerability feed request failed (simulated 500)'),
          ),
        ),
      );
    }
    return of(generateVulnFeed(40)).pipe(delay(600));
  }
}
