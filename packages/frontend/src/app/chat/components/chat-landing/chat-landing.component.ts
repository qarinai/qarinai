import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AgentService } from '../../services/agent.service';
import { ConversationComponent } from '../conversation/conversation.component';
import { palette, updatePrimaryPalette, updateSurfacePalette, usePreset } from '@primeng/themes';
import { IAgent } from '../../../pages/agents/_interfaces/agent.interface';

@Component({
  selector: 'app-chat-landing',
  imports: [ProgressSpinnerModule, RouterModule, ConversationComponent],
  templateUrl: './chat-landing.component.html',
  styleUrl: './chat-landing.component.scss'
})
export class ChatLandingComponent implements OnInit {
  isLoading = signal(true);
  isError = signal(false);
  isConversationOpen = signal(false);
  agent = signal<IAgent | undefined>(undefined);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly agentService = inject(AgentService);

  ngOnInit(): void {
    this.initializeChat();
  }

  private initializeChat() {
    const agentId = this.activatedRoute.snapshot.queryParamMap.get('agentId');

    if (!agentId) {
      this.isLoading.set(false);
      this.isError.set(true);
      console.error('No agentId provided in query parameters');
      return;
    }

    this.agentService.getAgentById(agentId).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.isError.set(false);
        this.isConversationOpen.set(true);
        this.agent.set(data as IAgent);

        // set primary colors

        document.documentElement.classList.add('app-dark');

        usePreset();
        console.log('agent fetched successfully', data);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.isConversationOpen.set(false);
        console.error('Error fetching agent:', error);
      }
    });
  }
}
