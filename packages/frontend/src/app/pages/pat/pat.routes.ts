import { Routes } from '@angular/router';
import { ListAccessTokensComponent } from './list/list-access-tokens.component';
import { AddAccessTokenComponent } from './add/add-access-token.component';

export default [
  {
    path: '',
    component: ListAccessTokensComponent
  },
  {
    path: 'add',
    component: AddAccessTokenComponent
  }
] as Routes;
