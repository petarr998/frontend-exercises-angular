import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { treeChartMockData } from '../charts-mock-data';
import {
  CHEVRON_COLOR,
  CHEVRON_DOWN,
  CHEVRON_RIGHT,
  CHEVRON_STROKE,
  GROUP_ICON,
  TREE_ICONS,
} from './tree-icons';
import {
  CARD_WIDTH,
  ORG_COLOR,
  TreeNode,
  assignGroupColors,
  toTreeNode,
} from './tree-chart.util';

// Structural view of a d3 hierarchy node with the mutable fields we add for
// collapsing (`_children`) and transitions (`x0`/`y0`). Kept separate from the
// d3 types (whose self-referential `this` fights intersections) and bridged
// with `unknown` casts only at the d3 boundary.
interface RenderNode {
  data: TreeNode;
  depth: number;
  parent: RenderNode | null;
  children?: RenderNode[];
  _children?: RenderNode[] | null;
  x?: number;
  y?: number;
  x0?: number;
  y0?: number;
  id?: number;
  descendants(): RenderNode[];
  links(): Array<{ source: RenderNode; target: RenderNode }>;
}

type LinkPoint = { x: number; y: number };

const MARGIN = { top: 48, right: 48, bottom: 48, left: 48 };
const COL_GAP = 90; // horizontal gap between a card's right edge and the next column
const VERTICAL_GAP = 5; // minimum gap between stacked cards
const DEFAULT_EXPANDED_DEPTH = 2;
const TOGGLE_R = 7;
const TOGGLE_X = CARD_WIDTH + TOGGLE_R + 2;
const LINK_START = CARD_WIDTH;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isCollapsible(d: RenderNode): boolean {
  return !!(d._children && d._children.length);
}

function isOpen(d: RenderNode): boolean {
  return !!(d.children && d.children.length);
}

@Component({
  selector: 'app-tree-chart',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tree-chart.component.html',
  styleUrl: './tree-chart.component.scss',
})
export class TreeChartComponent {
  private readonly router = inject(Router);
  private readonly figure =
    viewChild.required<ElementRef<HTMLElement>>('treeFigure');

  private readonly data = toTreeNode(treeChartMockData);

  private root!: RenderNode;
  private tree!: d3.TreeLayout<TreeNode>;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gLink!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gNode!: d3.Selection<SVGGElement, unknown, null, undefined>;

  private zoom = 1;
  private contentWidth = 0;
  private contentHeight = 0;

  private readonly diagonal = d3
    .linkHorizontal<
      { source: LinkPoint; target: LinkPoint },
      [number, number]
    >()
    .source((d) => [d.source.y + LINK_START, d.source.x])
    .target((d) => [d.target.y, d.target.x]);

  constructor() {
    afterNextRender(() => this.render());
  }

  protected backToMain(): void {
    this.router.navigateByUrl('');
  }

  protected changeZoom(direction: '+' | '-' | 'reset'): void {
    if (direction === 'reset') {
      this.zoom = 1;
    } else {
      this.zoom = Math.max(
        0.3,
        Math.min(3, this.zoom * (direction === '+' ? 1.2 : 1 / 1.2)),
      );
    }
    this.applyZoom();
  }

  private render(): void {
    const host = this.figure().nativeElement;
    host.replaceChildren();

    const hierarchyRoot = d3.hierarchy(this.data, (node) => node.children);
    assignGroupColors(hierarchyRoot);
    this.root = hierarchyRoot as unknown as RenderNode;

    this.root.x0 = 0;
    this.root.y0 = 0;
    const all = this.root.descendants();
    all.forEach((node, index) => {
      node.id = index;
      node._children = node.children ?? null;
    });
    all.forEach((node) => {
      if (node.depth >= DEFAULT_EXPANDED_DEPTH) {
        node.children = undefined;
      }
    });

    this.tree = d3
      .tree<TreeNode>()
      .nodeSize([1, CARD_WIDTH + COL_GAP])
      .separation(
        (a, b) => (a.data.cardHeight + b.data.cardHeight) / 2 + VERTICAL_GAP,
      );

    this.svg = d3
      .select(host)
      .append('svg')
      .attr('class', 'tree-svg')
      .attr('preserveAspectRatio', 'xMinYMin meet');
    this.gLink = this.svg.append('g').attr('class', 'tree-links');
    this.gNode = this.svg.append('g').attr('class', 'tree-nodes');

    this.update(this.root, false);
  }

  private update(source: RenderNode, animate = true): void {
    this.tree(this.root as unknown as d3.HierarchyNode<TreeNode>);

    const nodes = this.root.descendants().reverse();
    const links = this.root.links();

    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = 0;
    this.root.descendants().forEach((node) => {
      const half = node.data.cardHeight / 2;
      minX = Math.min(minX, (node.x ?? 0) - half);
      maxX = Math.max(maxX, (node.x ?? 0) + half);
      maxY = Math.max(maxY, node.y ?? 0);
    });

    this.contentWidth = maxY + TOGGLE_X + TOGGLE_R + MARGIN.left + MARGIN.right;
    this.contentHeight = maxX - minX + MARGIN.top + MARGIN.bottom;
    this.svg.attr(
      'viewBox',
      `${-MARGIN.left} ${minX - MARGIN.top} ${this.contentWidth} ${this.contentHeight}`,
    );
    this.applyZoom();

    const transition = this.svg.transition().duration(400);
    // Selection and Transition share the .attr/.remove API; apply positions with
    // or without the transition (instant on the first paint). Localized `any`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animated = (selection: any) =>
      animate ? selection.transition(transition) : selection;

    const node = this.gNode
      .selectAll<SVGGElement, RenderNode>('g.tree-node')
      .data(nodes, (d) => d.id!);

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', `translate(${source.y0 ?? 0},${source.x0 ?? 0})`)
      .attr('opacity', 0)
      .style('cursor', (d) => (isCollapsible(d) ? 'pointer' : 'default'))
      .on('click', (_event, d) => this.toggle(d));

    nodeEnter
      .append('foreignObject')
      .attr('class', 'tree-card-fo')
      .attr('width', CARD_WIDTH)
      .attr('height', (d) => d.data.cardHeight)
      .attr('x', 0)
      .attr('y', (d) => -d.data.cardHeight / 2)
      .append('xhtml:div')
      .attr('class', (d) => `tree-card tree-card--${d.data.model}`)
      .style('--group-color', (d) => d.data.color ?? ORG_COLOR);

    const toggleEnter = nodeEnter.append('g').attr('class', 'tree-toggle');
    toggleEnter.append('circle').attr('r', TOGGLE_R);
    toggleEnter
      .append('path')
      .attr('class', 'tree-toggle__icon')
      .attr('fill', 'none')
      .attr('stroke', CHEVRON_COLOR)
      .attr('stroke-width', CHEVRON_STROKE)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    const nodeMerge = node.merge(nodeEnter);
    nodeMerge
      .select<HTMLDivElement>('foreignObject > div')
      .html((d) => this.cardInner(d));

    nodeMerge
      .select<SVGGElement>('g.tree-toggle')
      .attr('display', (d) => (isCollapsible(d) ? null : 'none'))
      .attr('transform', () => `translate(${TOGGLE_X},0)`)
      .select('path.tree-toggle__icon')
      .attr('d', (d) => (isOpen(d) ? CHEVRON_DOWN : CHEVRON_RIGHT));

    animated(nodeMerge)
      .attr('transform', (d: RenderNode) => `translate(${d.y},${d.x})`)
      .attr('opacity', 1);

    animated(node.exit())
      .attr('transform', `translate(${source.y ?? 0},${source.x ?? 0})`)
      .attr('opacity', 0)
      .remove();

    const link = this.gLink
      .selectAll<
        SVGPathElement,
        { source: RenderNode; target: RenderNode }
      >('path.tree-link')
      .data(links, (d) => d.target.id!);

    const linkEnter = link
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('d', () => {
        const o = { x: source.x0 ?? 0, y: source.y0 ?? 0 };
        return this.diagonal({ source: o, target: o });
      });

    animated(link.merge(linkEnter)).attr(
      'd',
      (d: { source: RenderNode; target: RenderNode }) =>
        this.diagonal({
          source: { x: d.source.x ?? 0, y: d.source.y ?? 0 },
          target: { x: d.target.x ?? 0, y: d.target.y ?? 0 },
        }),
    );

    animated(link.exit())
      .attr('d', () => {
        const o = { x: source.x ?? 0, y: source.y ?? 0 };
        return this.diagonal({ source: o, target: o });
      })
      .remove();

    this.root.descendants().forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private toggle(d: RenderNode): void {
    if (!isCollapsible(d)) {
      return;
    }
    d.children = d.children ? undefined : (d._children ?? undefined);
    this.update(d);
  }

  private applyZoom(): void {
    this.svg
      .attr('width', this.contentWidth * this.zoom)
      .attr('height', this.contentHeight * this.zoom);
  }

  private cardInner(d: RenderNode): string {
    const node = d.data;

    if (node.model === 'assetList') {
      const rows = (node.assets ?? [])
        .map(
          (asset) => `
        <div class="asset-row">
          <span class="asset-row__ico">${TREE_ICONS['asset']}</span>
          <span class="asset-row__name" title="${escapeHtml(asset.name)}">${escapeHtml(asset.name)}${asset.version ? ` <em>${escapeHtml(asset.version)}</em>` : ''}</span>
        </div>`,
        )
        .join('');
      return `<div class="tree-card__surface"><div class="tree-card__assets">${rows}</div></div>`;
    }

    const icon = TREE_ICONS[node.model] ?? GROUP_ICON;
    const counts =
      node.model === 'group'
        ? `<div class="tree-card__counts">${node.groupCount ?? 0}G/${node.assetCount ?? 0}A</div>`
        : '';
    return `
      <div class="tree-card__surface">
        <span class="tree-card__icon">${icon}</span>
        <span class="tree-card__body">
          <span class="tree-card__name" title="${escapeHtml(node.name)}">${escapeHtml(node.name)}</span>
          ${counts}
        </span>
      </div>`;
  }
}
