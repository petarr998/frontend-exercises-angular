import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, Signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SeverityParams } from '../vuln-cards/vuln-cards-mock-data';
import { VulnFeedItem, VulnSeverityFilter } from './vuln-feed-models';
import { VulnFeedService } from './vuln-feed.service';
import { vulnFeedActions } from './vuln-feed-state/vuln-feed.actions';
import {
  filteredVulnsSelector,
  severityCountsSelector,
  sortOrderSelector,
  vulnsErrorSelector,
  vulnsLoadingSelector,
} from './vuln-feed-state/vuln-feed.selectors';
import { VulnFeedState } from './vuln-feed-state/vuln-feed.state';

@Component({
  selector: 'app-vuln-feed',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './vuln-feed.component.html',
  styleUrl: './vuln-feed.component.scss',
})
export class VulnFeedComponent implements OnInit {
  private readonly store = inject(Store<VulnFeedState>);
  private readonly router = inject(Router);
  protected readonly vulnFeedService = inject(VulnFeedService);

  readonly vulns: Signal<VulnFeedItem[]> =
    this.store.selectSignal(filteredVulnsSelector);
  readonly isVulnsLoading: Signal<boolean> =
    this.store.selectSignal(vulnsLoadingSelector);
  readonly error: Signal<string | null> =
    this.store.selectSignal(vulnsErrorSelector);
  readonly sortOrder = this.store.selectSignal(sortOrderSelector);
  private readonly severityCounts = this.store.selectSignal(
    severityCountsSelector,
  );

  protected readonly severityOptions = Object.entries(SeverityParams).map(
    ([key, params]) => ({ key, title: params.title }),
  );

  protected readonly severityStats = computed(() =>
    this.severityOptions.map((option) => ({
      ...option,
      count: this.severityCounts()[option.key as keyof ReturnType<typeof this.severityCounts>],
    })),
  );

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) =>
        this.store.dispatch(vulnFeedActions.setSearchQueryAction({ query })),
      );
  }

  ngOnInit(): void {
    this.store.dispatch(vulnFeedActions.getVulnsAction());
  }

  refresh(): void {
    this.store.dispatch(vulnFeedActions.getVulnsAction());
  }

  onSeverityFilterChange(severity: string): void {
    this.store.dispatch(
      vulnFeedActions.setSeverityFilterAction({
        severity: severity as VulnSeverityFilter,
      }),
    );
  }

  onSearchInput(query: string): void {
    this.searchInput$.next(query);
  }

  toggleSortOrder(): void {
    this.store.dispatch(
      vulnFeedActions.setSortOrderAction({
        sortOrder: this.sortOrder() === 'cvss-desc' ? 'cvss-asc' : 'cvss-desc',
      }),
    );
  }

  toggleSimulateError(): void {
    this.vulnFeedService.simulateError = !this.vulnFeedService.simulateError;
  }

  abbrFor(severity: string): string {
    return SeverityParams[severity]?.abbr ?? '?';
  }

  backToMain(): void {
    this.router.navigateByUrl('');
  }
}
