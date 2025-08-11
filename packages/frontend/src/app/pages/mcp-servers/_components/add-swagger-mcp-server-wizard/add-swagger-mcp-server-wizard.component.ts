import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { McpServerCreationManagerService } from '../../_services/mcp-server-creation-manager.service';
import { ImportSwaggerStepComponent } from '../import-swagger-step/import-swagger-step.component';
import { MessageService } from 'primeng/api';
import { SelectEndpointsStepComponent } from '../select-endpoints-step/select-endpoints-step.component';
import { ServerInformationStepComponent } from '../server-information-step/server-information-step.component';
import { ReviewDescriptionsStepComponent } from '../review-descriptions-step/review-descriptions-step.component';
import { CommonModule } from '@angular/common';
import { McpServerBackendService } from '../../_services/mcp-server-backend.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-swagger-mcp-server-wizard',
  imports: [
    ButtonModule,
    StepperModule,
    ImportSwaggerStepComponent,
    SelectEndpointsStepComponent,
    ServerInformationStepComponent,
    ReviewDescriptionsStepComponent,
    CommonModule,
    RouterModule
  ],
  providers: [McpServerBackendService],
  viewProviders: [McpServerCreationManagerService],
  templateUrl: './add-swagger-mcp-server-wizard.component.html',
  styleUrl: './add-swagger-mcp-server-wizard.component.scss'
})
export class AddSwaggerMcpServerWizardComponent implements OnInit {
  creationManager = inject(McpServerCreationManagerService);
  backendService = inject(McpServerBackendService);
  messageService = inject(MessageService);
  router = inject(Router);

  // Step validations
  stepValidations = {
    importSwagger: false,
    selectEndpoints: false,
    serverInformation: false,
    reviewDescriptions: false
  };

  currentStep = 1;

  ngOnInit(): void {
    this.creationManager.initializeCreation();
  }

  onImportSwaggerValid(isValid: boolean) {
    this.stepValidations.importSwagger = isValid;
  }

  onSelectEndpointsValid(isValid: boolean) {
    this.stepValidations.selectEndpoints = isValid;
  }

  onServerInformationValid(isValid: boolean) {
    this.stepValidations.serverInformation = isValid;
  }

  onReviewDescriptionsValid(isValid: boolean) {
    this.stepValidations.reviewDescriptions = isValid;
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.stepValidations.importSwagger;
      case 2:
        return this.stepValidations.selectEndpoints || this.creationManager.getSelectedEndpointIds().length > 0;
      case 3:
        return this.stepValidations.serverInformation;
      case 4:
        return this.stepValidations.reviewDescriptions;
      default:
        return false;
    }
  }

  onNextClick(nextStep: number) {
    if (!this.isStepValid(this.currentStep)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please complete all required fields before proceeding.'
      });
      return;
    }
    this.currentStep = nextStep;
  }

  onCreateServerClick() {
    if (!this.isStepValid(4)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please complete all required fields before creating the server.'
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Server Created',
      detail: 'MCP server has been created successfully.'
    });

    const serverData = this.creationManager.getFinalizedServerData();
    this.backendService.createMcpServer(serverData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Server Created',
          detail: `MCP server "${response.name}" has been created successfully.`
        });
        // redirect to list all servers
        this.router.navigate(['/pages/mcp-servers']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: `Failed to create MCP server: ${error.message}`
        });
        console.error('Server creation error:', error);
      }
    });

    // Here you would typically call a service method to create the server
    // this.creationManager.createServer();
  }
}
