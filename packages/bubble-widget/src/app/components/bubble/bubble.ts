import {
  Component,
  computed,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { QarinLogo } from '../qarin-logo/qarin-logo';
import { Message } from '../message/message';
import { AppService } from '../../app.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { faRefresh } from '@fortawesome/free-solid-svg-icons/faRefresh';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons/faTriangleExclamation';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { IAgent } from '../../interfaces/agent.interface';
import { IMessage } from '../../interfaces/message.interface';
import { CommonModule } from '@angular/common';
import {
  HttpEvent,
  HttpDownloadProgressEvent,
  HttpEventType,
} from '@angular/common/http';
import {
  IContentResponseChunk,
  IMessageInfoChunk,
  IResponseChunk,
} from '../../interfaces/response-chunk.interface';

@Component({
  selector: 'app-bubble',
  imports: [
    QarinLogo,
    Message,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommonModule,
  ],
  templateUrl: './bubble.html',
  styleUrl: './bubble.scss',
})
export class Bubble implements OnInit {
  service = inject(AppService);
  fb = inject(FormBuilder);

  windowOpened = signal(false);
  configError = signal(false);
  isAgentLoading = signal(false);
  agent = signal<null | IAgent>(null);
  convrsationId = signal<string | undefined>(undefined);

  userMessage = model<string>('');

  messagesList = signal<IMessage[]>([]);

  isLoadingResponse = signal<boolean>(false);

  isLastMessageUser = computed(() => {
    const messagesList = this.messagesList();
    if (messagesList.length === 0) {
      return false;
    }

    return messagesList.at(-1)?.role === 'user';
  });

  shouldNotSendMessage = computed(() => {
    return this.isLoadingResponse() || this.isLastMessageUser();
  });

  icons = {
    close: faXmark,
    refresh: faRefresh,
    warning: faTriangleExclamation,
    spinner: faSpinner,
  };

  textareaRows = computed(() => {
    const message = this.userMessage();
    const lines = message.split('\n').length;
    return Math.min(lines, 3);
  });

  constructor() {}

  ngOnInit(): void {
    const agentId = this.service.getAgentId();
    const baseUrl = this.service.getBaseUrl();
    if (!agentId || !baseUrl) {
      this.configError.set(true);
      return;
    }

    this.loadAgentDetails();
  }

  onMessageKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    const content = this.userMessage();
    if (!content.trim()) {
      return;
    }

    const newMessage: IMessage = {
      role: 'user',
      content: content.trim(),
    };

    this.messagesList.update((messages) => [...messages, newMessage]);
    this.userMessage.set('');

    this.isLoadingResponse.set(true);
    this.service
      .messageAgent(
        this.agent()?.id ?? '',
        content.trim(),
        this.convrsationId()
      )
      .subscribe({
        next: (event) => {
          this.handleHttpEvent(event);
        },
        error: () => {
          this.isLoadingResponse.set(false);
          // Handle error appropriately
        },
      });
  }

  restartConversation() {
    this.messagesList.set([]);
    this.userMessage.set('');
    this.convrsationId.set(undefined);
    this.isLoadingResponse.set(false);
    this.loadAgentDetails();
  }

  private handleHttpEvent(event: HttpEvent<string>) {
    if (event.type === HttpEventType.DownloadProgress) {
      const e = event as HttpDownloadProgressEvent;
      const chunks: IResponseChunk[] = e
        .partialText!.split('data: ')
        .map((chunk) => JSON.parse(chunk.trim() || '{}'));
      const lastMessage = this.messagesList().at(-1);
      let content: string = '';

      for (const chunk of chunks) {
        if ('c' in chunk) {
          const contentChunk = chunk as IContentResponseChunk;
          content += contentChunk.c;
        } else if ('tool_call' in chunk) {
          // Handle tool call chunk if needed
        } else if ('tokens' in chunk) {
          // Handle tokens chunk if needed
        } else if ('m' in chunk) {
          const messageInfo = chunk as IMessageInfoChunk;
          this.convrsationId.set(messageInfo.m.conversationId);
        }
      }
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = content;
        this.messagesList.update((messages) => [...messages]);
      } else {
        this.messagesList.update((messages) => [
          ...messages,
          { role: 'assistant', content },
        ]);
      }
    } else if (event.type === HttpEventType.Response) {
      this.isLoadingResponse.set(false);
    }
  }

  private loadAgentDetails() {
    this.isAgentLoading.set(true);
    this.service.getAgentDetails().subscribe({
      next: (agent) => {
        this.agent.set(agent);
        this.isAgentLoading.set(false);
      },
      error: () => {
        this.configError.set(true);
      },
    });
  }
}
