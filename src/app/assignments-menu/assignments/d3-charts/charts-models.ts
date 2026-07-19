export enum assignmentTypesEnum {
  tree = 'tree',
  'vuln-card' = 'vuln-card',
  'vuln-feed' = 'vuln-feed',
}

export const AssignmentTypesKeys = [
  { name: 'Tree Chart', param: 'tree' },
  { name: 'Vuln Card', param: 'vuln-card' },
  { name: 'Vuln Feed (NgRx)', param: 'vuln-feed' },
];

export type groupsItemModelType = 'asset' | 'group' | 'org';

export interface TreeChartDataModel {
  name: string;
  model?: groupsItemModelType;
  version?: string;
  assetCount?: number;
  groupCount?: number;
  isRoot?: boolean;
  children?: Array<TreeChartDataModel>;
}
