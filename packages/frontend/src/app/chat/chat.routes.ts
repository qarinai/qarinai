import { Routes } from '@angular/router';
import { ConversationComponent } from './components/conversation/conversation.component';
import { ChatLandingComponent } from './components/chat-landing/chat-landing.component';

export default [
  {
    path: '',
    component: ChatLandingComponent
  }
] as Routes;
