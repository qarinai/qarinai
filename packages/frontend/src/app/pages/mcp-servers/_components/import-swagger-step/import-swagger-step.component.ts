import { Component, EventEmitter, inject, Output } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { McpServerCreationManagerService } from '../../_services/mcp-server-creation-manager.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { InfoHelpComponent } from '../../../../utils/components/info-help/info-help.component';

@Component({
  selector: 'app-import-swagger-step',
  imports: [
    DividerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    FileUploadModule,
    InfoHelpComponent
  ],
  providers: [],
  templateUrl: './import-swagger-step.component.html',
  styleUrl: './import-swagger-step.component.scss'
})
export class ImportSwaggerStepComponent {
  messageService = inject(MessageService);
  creationManager = inject(McpServerCreationManagerService);

  // Using reactive form for better validation
  swaggerForm = new FormGroup({
    swaggerUrl: new FormControl('', [
      Validators.pattern(
        '^(https?:\\/\\/)' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|localhost|' + // domain name or localhost
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-\\w\\d%_.~+]*)*' + // port and path
          '(\\?[;&\\w\\d%_.~+=-]*)?' + // query string
          '(\\#[-\\w\\d_]*)?$' // fragment locator
      )
    ])
  });

  @Output()
  onValidChange = new EventEmitter<boolean>();

  get swaggerUrl() {
    return this.swaggerForm.get('swaggerUrl')?.value || '';
  }

  get urlValid(): boolean {
    const control = this.swaggerForm.get('swaggerUrl');
    return !!(control?.valid || (!control?.value && !control?.touched));
  }

  async onFileSelected(event: FileSelectEvent) {
    const file = event.files[0];

    if (!file) {
      console.error('No file selected');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No file selected'
      });
      return;
    }

    try {
      const fileContent = await file.text();
      const swaggerData = JSON.parse(fileContent);

      // Validate that it's a valid OpenAPI/Swagger file
      if (!swaggerData.swagger && !swaggerData.openapi) {
        throw new Error('Invalid Swagger/OpenAPI file');
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Swagger Data Imported',
        detail: 'Swagger data imported successfully from the file.'
      });
      this.creationManager.setSwaggerContent(swaggerData);
      this.onValidChange.emit(true);
    } catch (error) {
      console.error('Error parsing Swagger file:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid Swagger file format'
      });
    }
  }

  async onFetchSwaggerByUrlClick() {
    if (!this.swaggerForm.valid) {
      this.swaggerForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid URL',
        detail: 'Please enter a valid URL'
      });
      return;
    }

    try {
      const response = await fetch(this.swaggerUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const swaggerData = await response.json();

      // Validate that it's a valid OpenAPI/Swagger file
      if (!swaggerData.swagger && !swaggerData.openapi) {
        throw new Error('Invalid Swagger/OpenAPI file');
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Swagger Data Fetched',
        detail: 'Swagger data fetched successfully from the URL.'
      });
      this.creationManager.setSwaggerContent(swaggerData);
      this.onValidChange.emit(true);
    } catch (error) {
      console.error('Error fetching Swagger by URL:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Failed to fetch Swagger data'
      });
    }
  }
}
