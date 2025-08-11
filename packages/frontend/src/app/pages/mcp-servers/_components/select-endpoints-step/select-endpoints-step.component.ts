import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { IEndpoint } from '../../_interfaces/endpoint.interface';
import { McpServerCreationManagerService } from '../../_services/mcp-server-creation-manager.service';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-select-endpoints-step',
  imports: [CheckboxModule, FormsModule, CommonModule, TagModule],
  templateUrl: './select-endpoints-step.component.html',
  styleUrl: './select-endpoints-step.component.scss'
})
export class SelectEndpointsStepComponent implements OnInit {
  creationManager = inject(McpServerCreationManagerService);

  selectAll: boolean = false;

  allEndpoints: IEndpoint[] = [];

  selectedEndpointIds: string[] = [];

  @Output() onValidChange = new EventEmitter<boolean>();

  methodsSeverityMap: Record<string, string> = {
    post: 'success',
    get: 'info',
    put: 'warn',
    delete: 'danger',
    patch: 'secondary',
    options: 'secondary',
    head: 'secondary',
    trace: 'secondary'
  };

  get isIndeterminate(): boolean {
    return this.selectedEndpointIds.length > 0 && this.selectedEndpointIds.length < this.allEndpoints.length;
  }

  ngOnInit(): void {
    this.allEndpoints = this.creationManager.getAllEndpoints();
    // Initialize with empty selection and validate
    this.validateSelection();
  }

  onSelectAllChange(event: CheckboxChangeEvent) {
    if (event.checked) {
      this.selectedEndpointIds = [...this.allEndpoints.map((e) => e.id)];
    } else {
      this.selectedEndpointIds = [];
    }

    this.creationManager.setSelectedEndpointIds(this.selectedEndpointIds);
    this.validateSelection();
  }

  onEndpointSelectChange() {
    if (this.selectedEndpointIds.length === this.allEndpoints.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    this.creationManager.setSelectedEndpointIds(this.selectedEndpointIds);
    this.validateSelection();
  }

  validateSelection() {
    // At least one endpoint must be selected
    const isValid = this.selectedEndpointIds.length > 0;
    this.onValidChange.emit(isValid);
  }
}
