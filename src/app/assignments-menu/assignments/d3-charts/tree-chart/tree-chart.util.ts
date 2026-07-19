import type { HierarchyNode } from 'd3';
import { TreeChartDataModel } from '../charts-models';

export const CARD_WIDTH = 210;
export const BASE_CARD_HEIGHT = 56;
export const ASSET_ROW_HEIGHT = 26;
const ASSET_LIST_PADDING = 16;
export const MAX_ASSET_LIST_HEIGHT = BASE_CARD_HEIGHT * 3; // spec: max 3× base card, scroll beyond

// Distinct group colors; children inherit their top-level group's color.
export const GROUP_COLORS = [
  '#6c5ce7', // purple
  '#2e7d32', // green
  '#e8822e', // orange
  '#0f93bb', // teal
  '#1d77ff', // blue
  '#d9534f', // red
];
export const ORG_COLOR = '#8792a8'; // neutral for the org root

export interface TreeAsset {
  name: string;
  version?: string;
}

export interface TreeNode {
  name: string;
  model: 'org' | 'group' | 'asset' | 'assetList';
  version?: string;
  groupCount?: number;
  assetCount?: number;
  assets?: TreeAsset[];
  cardHeight: number;
  color?: string;
  children?: TreeNode[];
}

export function colorForIndex(index: number): string {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

function assetListNode(assets: TreeChartDataModel[]): TreeNode {
  const items: TreeAsset[] = assets.map((asset) => ({
    name: asset.name,
    version: asset.version,
  }));
  const height = Math.min(
    items.length * ASSET_ROW_HEIGHT + ASSET_LIST_PADDING,
    MAX_ASSET_LIST_HEIGHT,
  );
  return {
    name: `Assets (${items.length})`,
    model: 'assetList',
    assets: items,
    cardHeight: height,
  };
}

/**
 * Transforms the raw chart data into render nodes: group/org nodes stay as
 * individual cards, while all asset siblings of a node are combined into a
 * single scrollable "assetList" card (the bonus).
 */
export function toTreeNode(data: TreeChartDataModel): TreeNode {
  const rawChildren = data.children ?? [];
  const groups = rawChildren.filter((child) => child.model !== 'asset');
  const assets = rawChildren.filter((child) => child.model === 'asset');

  const children: TreeNode[] = groups.map(toTreeNode);
  if (assets.length) {
    children.push(assetListNode(assets));
  }

  return {
    name: data.name,
    model: (data.model ?? 'group') as TreeNode['model'],
    version: data.version,
    groupCount: data.groupCount,
    assetCount: data.assetCount,
    cardHeight: BASE_CARD_HEIGHT,
    children: children.length ? children : undefined,
  };
}

/**
 * Assigns a color to every node: the org root is neutral, each depth-1 branch
 * gets a distinct palette color, and every descendant inherits its depth-1
 * ancestor's color. Runs on the full hierarchy before any collapsing.
 */
export function assignGroupColors(root: HierarchyNode<TreeNode>): void {
  const topColor = new Map<HierarchyNode<TreeNode>, string>();
  (root.children ?? []).forEach((child, index) =>
    topColor.set(child, colorForIndex(index)),
  );

  root.each((node) => {
    if (node.depth === 0) {
      node.data.color = ORG_COLOR;
      return;
    }
    const top = node.ancestors().find((ancestor) => ancestor.depth === 1);
    node.data.color = (top && topColor.get(top)) ?? ORG_COLOR;
  });
}
