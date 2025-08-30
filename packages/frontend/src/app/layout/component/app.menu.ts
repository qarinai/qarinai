import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `
})
export class AppMenu {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: ['/pages/dashboard'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          }
        ]
      },
      {
        label: 'Sections',
        items: [
          {
            label: 'LLM Providers',
            icon: 'pi pi-comments',
            routerLink: ['/pages/llm-providers'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          },
          {
            label: 'Mcp Servers',
            icon: 'pi pi-server',
            routerLink: ['/pages/mcp-servers'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          },
          {
            label: 'Agents',
            icon: 'pi pi-sparkles',
            routerLink: ['/pages/agents'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          },
          {
            label: 'Vector Stores',
            icon: 'pi pi-database',
            routerLink: ['/pages/vector-stores'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          }
        ]
      },
      {
        label: 'General',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: ['/pages/settings'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          },
          {
            label: 'Help',
            icon: 'pi pi-question-circle',
            routerLink: ['/pages/help'],
            routerLinkActiveOptions: {
              paths: 'subset',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored'
            }
          }
        ]
      }
    ];
  }
}
