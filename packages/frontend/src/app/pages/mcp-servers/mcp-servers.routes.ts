import { Routes } from '@angular/router';
import { ListMcpServersComponent } from './list/list-mcp-servers.component';
import { AddMcpServerComponent } from './add/add-mcp-server.component';
import { AddSwaggerMcpServerWizardComponent } from './_components/add-swagger-mcp-server-wizard/add-swagger-mcp-server-wizard.component';
import { AddMcpProxyServerWizardComponent } from './_components/add-mcp-proxy-server-wizard/add-mcp-proxy-server-wizard.component';

export default [
  {
    path: '',
    component: ListMcpServersComponent
  },
  {
    path: 'add',
    component: AddMcpServerComponent
  },
  {
    path: 'add/swagger',
    component: AddSwaggerMcpServerWizardComponent
  },
  {
    path: 'add/mcp-proxy',
    component: AddMcpProxyServerWizardComponent
  }
] as Routes;
