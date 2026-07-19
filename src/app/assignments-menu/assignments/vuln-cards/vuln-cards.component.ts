import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkAutoSizeVirtualScroll } from '@angular/cdk-experimental/scrolling';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VulnCardComponent } from './vuln-card/vuln-card.component';
import { VulnCard, generateVulnCards } from './vuln-cards-models';

@Component({
  selector: 'app-vuln-cards',
  standalone: true,
  imports: [ScrollingModule, CdkAutoSizeVirtualScroll, VulnCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vuln-cards.component.html',
  styleUrl: './vuln-cards.component.scss',
})
export class VulnCardsComponent {
  private readonly router = inject(Router);

  protected readonly cards = generateVulnCards(1000);

  // Expanded state lives here, keyed by id, so it survives cdkVirtualFor view
  // recycling (an internal per-card flag would leak onto recycled rows).
  private readonly expandedIds = signal<ReadonlySet<string>>(new Set());

  protected trackById(_index: number, card: VulnCard): string {
    return card.id;
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected setExpanded(id: string, expanded: boolean): void {
    this.expandedIds.update((ids) => {
      const next = new Set(ids);
      if (expanded) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  protected backToMain(): void {
    this.router.navigateByUrl('');
  }
}
