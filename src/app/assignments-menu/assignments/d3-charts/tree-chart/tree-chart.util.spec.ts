import * as d3 from 'd3';
import { TreeChartDataModel } from '../charts-models';
import {
  GROUP_COLORS,
  ORG_COLOR,
  assignGroupColors,
  toTreeNode,
} from './tree-chart.util';

const mock: TreeChartDataModel = {
  name: 'Org',
  model: 'org',
  children: [
    {
      name: 'G1',
      model: 'group',
      groupCount: 1,
      assetCount: 2,
      children: [
        { name: 'sub', model: 'group', groupCount: 0, assetCount: 0 },
        { name: 'a1', model: 'asset' },
        { name: 'a2', model: 'asset', version: 'v2' },
      ],
    },
    { name: 'G2', model: 'group' },
  ],
};

describe('toTreeNode', () => {
  it('combines asset siblings into a single assetList node', () => {
    const tree = toTreeNode(mock);
    const g1 = tree.children![0];

    // sub-group stays a card; the two assets collapse into one assetList
    expect(g1.children!.map((c) => c.model)).toEqual(['group', 'assetList']);

    const assetList = g1.children![1];
    expect(assetList.name).toBe('Assets (2)');
    expect(assetList.assets).toEqual([
      { name: 'a1', version: undefined },
      { name: 'a2', version: 'v2' },
    ]);
  });

  it('leaves group-only nodes without an assetList and childless nodes empty', () => {
    const tree = toTreeNode(mock);
    expect(tree.children![1].name).toBe('G2');
    expect(tree.children![1].children).toBeUndefined();
  });
});

describe('assignGroupColors', () => {
  it('gives the org root a neutral color and cascades group colors to descendants', () => {
    const root = d3.hierarchy(toTreeNode(mock), (node) => node.children);
    assignGroupColors(root);

    expect(root.data.color).toBe(ORG_COLOR);
    expect(root.children![0].data.color).toBe(GROUP_COLORS[0]); // G1
    expect(root.children![1].data.color).toBe(GROUP_COLORS[1]); // G2

    // G1's descendants (sub-group + assetList) inherit G1's color
    expect(root.children![0].children![0].data.color).toBe(GROUP_COLORS[0]);
    expect(root.children![0].children![1].data.color).toBe(GROUP_COLORS[0]);
  });
});
