import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { McpServerBackendService } from '../../_services/mcp-server-backend.service';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { McpPropeBackendService } from '../../_services/mcp-prope-backend.service';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { McpAdapterServerType } from '../../_interfaces/mcp-server.interface';

@Component({
  selector: 'app-add-mcp-proxy-server-wizard',
  imports: [
    ButtonModule,
    StepperModule,
    CommonModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule
  ],
  providers: [McpServerBackendService, McpPropeBackendService],
  templateUrl: './add-mcp-proxy-server-wizard.component.html',
  styleUrl: './add-mcp-proxy-server-wizard.component.scss'
})
export class AddMcpProxyServerWizardComponent implements OnInit {
  router = inject(Router);
  fb = inject(FormBuilder);
  mcpPropeService = inject(McpPropeBackendService);
  mcpBackendService = inject(McpServerBackendService);
  messageService = inject(MessageService);

  currentStep = signal(1);
  toolsLoading = signal(false);

  loadedTools = signal<any[]>([]);

  selectedTools = signal<any[]>([]);

  availableTokenTypes = [
    {
      label: 'None',
      value: null
    },
    {
      label: 'Bearer Token',
      value: 'bearer'
    },
    {
      label: 'Basic Auth',
      value: 'basic'
    }
  ];

  form = this.fb.group({
    mcpUrl: ['', { updateOn: 'blur' }, [Validators.required]],
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    tokenType: [null],
    tokenValue: ['']
  });

  ngOnInit(): void {
    this.form.get('tokenType')?.valueChanges.subscribe((value) => {
      if (value) {
        this.form.get('tokenValue')?.setValidators([Validators.required]);
      } else {
        this.form.get('tokenValue')?.clearValidators();
      }
      this.form.get('tokenValue')?.reset();
      this.form.get('tokenValue')?.updateValueAndValidity();
    });
  }

  onStep2Click() {
    if (this.form.valid) {
      // load tools from mcp server
      this.loadToolsFromMcpServer();
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
    }
  }

  onSaveClick() {
    console.log(this.selectedTools());
    if (this.selectedTools().length === 0) {
      this.messageService.add({
        detail: 'Select at least one tool to continue',
        summary: 'Error',
        severity: 'error'
      });
      return;
    }

    const formValue = this.form.value as Required<typeof this.form.value>;

    this.mcpBackendService
      .createMcpServer({
        name: formValue.name ?? '',
        description: formValue.description ?? '',
        type: McpAdapterServerType.McpProxy,
        security: {
          isSecure: !!formValue.tokenType,
          securityType: formValue.tokenType ?? 'none',
          value: formValue.tokenType
            ? {
                type: 'static',
                token: formValue.tokenValue
              }
            : undefined,
          authParamName: formValue.tokenType ? 'Authorization' : undefined,
          authParamIn: formValue.tokenType ? 'header' : undefined
        } as unknown as any,
        tools: this.selectedTools().map((tool) => ({
          name: tool.name,
          description: tool.description,
          type: 'mcp_call_tool',
          data: {
            url: formValue.mcpUrl,
            inputSchema: tool.inputSchema
          }
        }))
      } as any)
      .subscribe((saved) => {
        console.log('saved mcp', saved);
      });
  }

  private async loadToolsFromMcpServer() {
    this.toolsLoading.set(true);
    const values = this.form.value;
    this.mcpPropeService
      .listMcpTools({
        url: values.mcpUrl ?? '',
        token: values.tokenValue ?? undefined,
        tokenType: values.tokenType ?? undefined
      })
      .subscribe((tools) => {
        this.loadedTools.set([...tools]);
        this.selectedTools.set([...tools]);
        this.toolsLoading.set(false);
        this.currentStep.set(2);
      });
  }
}
