import { Routes } from '@angular/router';
import { ListChatProvidersComponent } from './list/list-chat-providers.component';
import { AddChatProviderComponent } from './add/add-chat-provider.component';

export default [
  {
    path: '',
    component: ListChatProvidersComponent
  },
  {
    path: 'add',
    component: AddChatProviderComponent
  }
] as Routes;
