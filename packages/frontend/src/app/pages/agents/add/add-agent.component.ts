import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ChatProviderBackendService } from '../../chat-providers/_services/chat-provider-backend.service';
import { IChatProvider } from '../../chat-providers/_interfaces/chat-provider.interface';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { McpServerBackendService } from '../../mcp-servers/_services/mcp-server-backend.service';
import { IMcpServer } from '../../mcp-servers/_interfaces/mcp-server.interface';
import { AgentsBackendService } from '../_services/agents-backend.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { IAgent } from '../_interfaces/agent.interface';
import { InfoHelpComponent } from '../../../utils/components/info-help/info-help.component';

@Component({
  selector: 'app-add-agent',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    DividerModule,
    SelectModule,
    MultiSelectModule,
    InfoHelpComponent
  ],
  providers: [ChatProviderBackendService, McpServerBackendService, AgentsBackendService],
  templateUrl: './add-agent.component.html',
  styleUrl: './add-agent.component.scss'
})
export class AddAgentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly chatProviderService = inject(ChatProviderBackendService);
  private readonly mcpServersService = inject(McpServerBackendService);
  private readonly agentService = inject(AgentsBackendService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isEditMode = signal<boolean>(false);
  agentToEdit = signal<IAgent | null>(null);

  isLoadingModels = signal<boolean>(false);
  chatProviders = signal<IChatProvider[]>([]);

  additionalAllowedModels = computed(() => {
    return this.chatProviders().map((provider) => ({
      ...provider,
      models: provider.models.filter((model) => model.id !== this.agentFormValue()?.defaultModelId)
    }));
  });

  isLoadingMcpServers = signal<boolean>(false);
  mcpServers = signal<IMcpServer[]>([]);

  agentForm = this.fb.group({
    name: ['', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }],
    description: [
      '',
      { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(120)] }
    ],
    identityMessage: ['', { nonNullable: true, validators: [Validators.required, Validators.minLength(50)] }],
    systemMessage: ['', { nonNullable: true, validators: [Validators.required] }],
    defaultModelId: [''],
    allowedModelIds: [[]],
    linkedMcpServerIds: [[]]
  });

  agentFormValue = toSignal(this.agentForm.valueChanges, { initialValue: this.agentForm.value });

  constructor() {}

  ngOnInit() {
    this.prepareEditMode();
    this.loadModels();
    this.loadMcpServers();
  }

  loadModels() {
    this.isLoadingModels.set(true);
    this.chatProviderService.listChatProviders().subscribe({
      next: (providers) => {
        this.chatProviders.set(providers);
        this.isLoadingModels.set(false);
      },
      error: (error) => {
        console.error('Error loading chat providers:', error);
        this.isLoadingModels.set(false);
      }
    });
  }

  loadMcpServers() {
    this.isLoadingMcpServers.set(true);
    this.mcpServersService.listMcpServers().subscribe({
      next: (servers) => {
        this.mcpServers.set(servers);
        this.isLoadingMcpServers.set(false);
      },
      error: (error) => {
        console.error('Error loading MCP servers:', error);
        this.isLoadingMcpServers.set(false);
      }
    });
  }

  saveAgent() {
    if (this.agentForm.invalid) {
      console.error('Form is invalid:', this.agentForm.errors);
      return;
    }

    const agentData = this.agentForm.value;
    console.log('Saving agent with data:', agentData);

    let agentRequest: ReturnType<typeof this.agentService.createAgent>;
    if (this.isEditMode()) {
      agentRequest = this.agentService.updateAgent(this.agentToEdit()?.id ?? '', agentData);
    } else {
      agentRequest = this.agentService.createAgent(agentData);
    }

    // For example:
    agentRequest.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Agent saved successfully!'
        });
        this.router.navigate(['/pages/agents']);
      },
      error: (error) => {
        console.error('Error saving agent:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save agent'
        });
      }
    });
  }

  private prepareEditMode() {
    const isEditMode = this.activatedRoute.snapshot.url.some((segment) => segment.path === 'edit');
    this.isEditMode.set(isEditMode);
    if (isEditMode) {
      const agentId = this.activatedRoute.snapshot.paramMap.get('id');
      if (agentId) {
        this.agentService.getAgentById(agentId).subscribe({
          next: (agent) => {
            this.agentToEdit.set(agent);
            this.agentForm.patchValue({
              name: agent.name,
              description: agent.description,
              identityMessage: agent.identityMessage,
              systemMessage: agent.systemMessage,
              defaultModelId: agent.defaultModel.id,
              allowedModelIds: (agent?.allowedModels?.map((model) => model.id) || []) as any,
              linkedMcpServerIds: (agent.linkedMCPServers?.map((server) => server.id) || []) as any
            });

            console.log(this.agentForm.value);
          },
          error: (error) => {
            console.error('Error loading agent for edit:', error);
          }
        });
      }
    }
  }
}
