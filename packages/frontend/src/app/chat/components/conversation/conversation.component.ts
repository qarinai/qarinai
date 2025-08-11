import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { IAgent } from '../../../pages/agents/_interfaces/agent.interface';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../services/agent.service';
import { HttpDownloadProgressEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { $t } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { preset } from '../../../layout/layout.config';
import { LayoutService } from '../../../layout/service/layout.service';

interface UIMessage {
  role: 'user' | 'assistant';
  content: string;
  thinkContent?: string;
  loading?: boolean;
  id: string;
}

@Component({
  selector: 'app-conversation',
  imports: [MarkdownModule, FormsModule, ReactiveFormsModule, CommonModule],
  providers: [],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnInit {
  fb = inject(FormBuilder);
  agentService = inject(AgentService);
  layoutService = inject(LayoutService);
  agent = input.required<IAgent>();
  conversationId = signal<string | undefined>(undefined);

  messages: Array<UIMessage> = [];

  form = this.fb.group({
    content: ['', Validators.required]
  });

  ngOnInit(): void {
    this.layoutService.layoutConfig.update((state) => ({ ...state }));
    $t().preset(Aura).preset(preset).use({ useDefaultOptions: true });
  }

  submit() {
    if (this.form.invalid) {
      console.log('form is invalid');
      return;
    }

    const content = this.form.value.content as string;
    this.form.reset();

    const userMessage: UIMessage = {
      role: 'user',
      content: content,
      id: '--last--'
    };

    this.messages.push(userMessage);
    this.ensureScrolledToBottom();

    const newMessage: UIMessage = {
      role: 'assistant',
      content: '',
      id: ''
    };

    let chunkCount = 0;
    let thinking = false;

    const thinkingBox = `<div class="thinking animate-pulse p-1 border border-surface-800 border-dashed">Thinking...</div>`;

    this.agentService.messageAgent(this.agent().id, content, this.conversationId()).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          const partialContent = (event as HttpDownloadProgressEvent).partialText!;
          // console.log('Partial content received:', partialContent);
          const chunks = partialContent.split('data: ').map((chunk) => chunk.trim());

          if (chunks.length > chunkCount) {
            const chunkDiff = chunks.length - chunkCount;
            chunkCount = chunks.length;
            const parsedChunks = chunks.slice(-chunkDiff).map((chunk) => JSON.parse(chunk || '{}'));
            for (const chunk of parsedChunks) {
              if (chunk?.c) {
                if (thinking && !newMessage.thinkContent) {
                  newMessage.thinkContent = chunk.c;
                } else if (thinking && newMessage.thinkContent) {
                  newMessage.thinkContent += chunk.c;
                } else if (!thinking) {
                  if (newMessage.content === thinkingBox) {
                    newMessage.content = '';
                  }
                  newMessage.content += chunk.c;
                }

                if (this.messages[this.messages.length - 1].role === 'user') {
                  this.messages.push(newMessage);
                }

                this.ensureScrolledToBottom();
              }

              if (chunk?.m?.messageId) {
                userMessage.id = chunk.m.messageId;
              }

              if (chunk?.m?.conversationId) {
                this.conversationId.set(chunk.m.conversationId);
              }

              if (chunk?.m?.rMessageId) {
                newMessage.id = chunk.m.rMessageId;
              }

              if (chunk?.m?.thinking === 'start') {
                thinking = true;
                newMessage.content = thinkingBox;
              }

              if (chunk?.m?.thinking === 'end') {
                thinking = false;
              }
            }
          }

          if (!newMessage.loading) {
            newMessage.loading = true;
          }
        } else if (event.type === HttpEventType.Response) {
          // finished receiving the response
          newMessage.loading = false;
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  ensureScrolledToBottom() {
    document.getElementById('chat-list')?.scrollTo({
      top: document.getElementById('chat-list')?.scrollHeight || 0,
      behavior: 'smooth'
    });
  }

  onTextareaKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }
}
