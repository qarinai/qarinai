import { Routes } from '@angular/router';
import { ListLlmProvidersComponent } from './list/list-llm-providers.component';
import { AddLlmProviderComponent } from './add/add-llm-provider.component';

export default [
  {
    path: '',
    component: ListLlmProvidersComponent
  },
  {
    path: 'add',
    component: AddLlmProviderComponent
  }
] as Routes;
