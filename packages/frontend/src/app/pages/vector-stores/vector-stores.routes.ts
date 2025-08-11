import { Routes } from '@angular/router';
import { ListVectorStoresComponent } from './list/list-vector-stores.component';
import { AddVectorStoreComponent } from './add/add-vector-store.component';
import { ViewVectorStoreComponent } from './view/view-vector-store.component';

export default [
  {
    path: '',
    component: ListVectorStoresComponent
  },
  {
    path: 'add',
    component: AddVectorStoreComponent
  },
  {
    path: ':id',
    component: ViewVectorStoreComponent
  }
] as Routes;
