import { Component } from '@angular/core';
import {
  assignmentTypesEnum,
  AssignmentTypesKeys,
} from './assignments/d3-charts/charts-models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assignments-menu',
  standalone: true,
  imports: [],
  templateUrl: './assignments-menu.component.html',
  styleUrl: './assignments-menu.component.scss',
})
export class AssignmentsMenuComponent {
  AssignmentTypesKeys = AssignmentTypesKeys;
  assignmentTypesEnum = assignmentTypesEnum;

  constructor(private router: Router) {}

  chartSelected(type: string) {
    let routeUrl: string = '';
    switch (type) {
      case assignmentTypesEnum.tree:
        routeUrl = 'tree-chart';
        break;
      case assignmentTypesEnum['vuln-card']:
        routeUrl = 'vuln-cards';
        break;
      case assignmentTypesEnum['vuln-feed']:
        routeUrl = 'vuln-feed';
        break;
      default:
        break;
    }
    this.router.navigateByUrl(routeUrl);
  }
}
