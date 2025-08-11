import { Routes } from '@angular/router';
import { ListAgentsComponent } from './list/list-agents.component';
import { AddAgentComponent } from './add/add-agent.component';

export default [
  {
    path: '',
    component: ListAgentsComponent
  },
  {
    path: 'add',
    component: AddAgentComponent
  },
  {
    path: 'edit/:id',
    component: AddAgentComponent
  }
] as Routes;
