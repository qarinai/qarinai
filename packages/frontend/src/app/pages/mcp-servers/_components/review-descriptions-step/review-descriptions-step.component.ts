import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { McpServerCreationManagerService } from '../../_services/mcp-server-creation-manager.service';
import { IEndpoint } from '../../_interfaces/endpoint.interface';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import _ from 'lodash';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-descriptions-step',
  imports: [
    MessageModule,
    CommonModule,
    TagModule,
    TextareaModule,
    DividerModule,
    FormsModule,
    FieldsetModule,
    ReactiveFormsModule
  ],
  templateUrl: './review-descriptions-step.component.html',
  styleUrl: './review-descriptions-step.component.scss'
})
export class ReviewDescriptionsStepComponent implements OnInit {
  creationManager = inject(McpServerCreationManagerService);
  fb = inject(FormBuilder);

  endpoints: IEndpoint[] = [];
  endpointForms: FormGroup[] = [];

  @Output() onValidChange = new EventEmitter<boolean>();

  paramGroups = ['bodyParams', 'pathParams', 'queryParams', 'headerParams'] as const;
  paramLegends: Record<(typeof this.paramGroups)[number], string> = {
    bodyParams: 'Request Body Parameters',
    pathParams: 'Path Parameters',
    queryParams: 'Query Parameters',
    headerParams: 'Header Parameters'
  };

  ngOnInit(): void {
    this.endpoints = this.creationManager.getSelectedEndpointsWithDetails();
    this.createFormGroups();
  }

  private createFormGroups() {
    this.endpointForms = this.endpoints.map((endpoint, index) => {
      const paramControls: Record<string, any> = {};

      // For each parameter group (body, path, query, header)
      this.paramGroups.forEach((groupName) => {
        if (endpoint.toolData?.[groupName]) {
          const paramGroup: Record<string, any> = {};

          // For each parameter in the group
          Object.entries(endpoint.toolData[groupName]).forEach(([paramKey, paramValue]: [string, any]) => {
            paramGroup[paramKey] = this.fb.group({
              description: [paramValue.description || '', [Validators.required]]
            });
          });

          if (Object.keys(paramGroup).length > 0) {
            paramControls[groupName] = this.fb.group(paramGroup);
          }
        }
      });

      // Create the form group for the endpoint
      const form = this.fb.group({
        id: [endpoint.id],
        description: [endpoint.description || '', [Validators.required]],
        ...paramControls
      });

      // Subscribe to value changes
      form.valueChanges.subscribe((value) => {
        this.updateEndpoint(index, value);
        this.validateForms();
      });

      return form;
    });

    // Initial validation
    this.validateForms();
  }

  private updateEndpoint(index: number, value: any) {
    if (index >= 0 && index < this.endpoints.length) {
      // Update the description
      this.endpoints[index].description = value.description;

      // Update parameter descriptions
      this.paramGroups.forEach((groupName) => {
        if (value[groupName] && this.endpoints[index].toolData?.[groupName]) {
          Object.keys(value[groupName]).forEach((paramKey) => {
            if (this.endpoints[index].toolData?.[groupName]?.[paramKey]) {
              this.endpoints[index].toolData[groupName][paramKey].description = value[groupName][paramKey].description;
            }
          });
        }
      });

      this.creationManager.setUpdatedEndpoints(this.endpoints);
    }
  }

  private validateForms() {
    const isValid = this.endpointForms.every((form) => form.valid);
    this.onValidChange.emit(isValid);
  }

  getParamForm(endpointForm: FormGroup, groupName: string, paramKey: string): FormGroup {
    return endpointForm.get(groupName)?.get(paramKey) as FormGroup;
  }

  getParamFormControl(endpointForm: FormGroup, groupName: string, paramKey: string, controlName: string): FormControl {
    return this.getParamForm(endpointForm, groupName, paramKey).get(controlName) as FormControl;
  }

  getIterableParams(endpoint: IEndpoint, groupName: string): { key: string; value: any }[] {
    if (!endpoint.toolData || !endpoint.toolData[groupName as keyof typeof endpoint.toolData]) return [];

    const data = endpoint.toolData[groupName as keyof typeof endpoint.toolData] as Record<string, any>;
    return Object.entries(data).map(([key, value]: [string, any]) => ({
      key,
      value
    }));
  }

  doesHaveParams(params: any): boolean {
    return !_.isEmpty(params);
  }

  isAllFormsValid(): boolean {
    return this.endpointForms.every((form: any) => form.valid);
  }
}
