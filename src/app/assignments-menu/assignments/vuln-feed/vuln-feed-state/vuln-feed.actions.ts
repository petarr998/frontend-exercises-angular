import { createAction, props } from '@ngrx/store';
import {
  CvssSortOrder,
  VulnFeedItem,
  VulnSeverityFilter,
} from '../vuln-feed-models';

export const vulnFeedActions = {
  getVulnsAction: createAction('[Vuln Feed/API] Get Vulns Action'),
  getVulnsActionSuccess: createAction(
    '[Vuln Feed/API] Get Vulns Action Success',
    props<{ vulns: VulnFeedItem[] }>(),
  ),
  getVulnsActionFailure: createAction(
    '[Vuln Feed/API] Get Vulns Action Failure',
    props<{ error: string }>(),
  ),
  setSeverityFilterAction: createAction(
    '[Vuln Feed] Set Severity Filter Action',
    props<{ severity: VulnSeverityFilter }>(),
  ),
  setSearchQueryAction: createAction(
    '[Vuln Feed] Set Search Query Action',
    props<{ query: string }>(),
  ),
  setSortOrderAction: createAction(
    '[Vuln Feed] Set Sort Order Action',
    props<{ sortOrder: CvssSortOrder }>(),
  ),
};
