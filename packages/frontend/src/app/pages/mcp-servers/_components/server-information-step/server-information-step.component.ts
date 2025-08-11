import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { CommonModule } from '@angular/common';
import { McpServerCreationManagerService } from '../../_services/mcp-server-creation-manager.service';
import { OpenApiServer } from 'openapi-v3';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-server-information-step',
  imports: [
    InputTextModule,
    TextareaModule,
    RadioButtonModule,
    FieldsetModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MessageModule
  ],
  templateUrl: './server-information-step.component.html',
  styleUrl: './server-information-step.component.scss'
})
export class ServerInformationStepComponent implements OnInit {
  creationManager = inject(McpServerCreationManagerService);
  fb = inject(FormBuilder);

  existingServers: OpenApiServer[] = [];
  selectedServerUrl: string = '';
  customServerUrl: string = '';

  selectedSecurityType: 'none' | 'basic' | 'bearer' = 'none';
  selectedCredentialType: 'static' | 'dynamic' = 'static';

  @Output() onValidChange = new EventEmitter<boolean>();

  // Create form group with validation
  serverForm = this.fb.group({
    serverName: ['', [Validators.required, Validators.minLength(3)]],
    serverDescription: [''],
    customServerUrl: [
      '',
      [
        // Only required if selectedServerUrl is '__other__', we'll handle this conditionally
        Validators.pattern(
          '^(https?:\\/\\/)' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$' // fragment locator
        )
      ]
    ]
  });

  // For security credentials
  basicForm = this.fb.group({
    username: ['', this.selectedCredentialType === 'static' ? Validators.required : []],
    password: ['', this.selectedCredentialType === 'static' ? Validators.required : []]
  });

  bearerForm = this.fb.group({
    token: ['', this.selectedCredentialType === 'static' ? Validators.required : []]
  });

  ngOnInit(): void {
    this.existingServers = this.creationManager.getAllServers();

    // Initialize form with existing data
    const serverName = this.creationManager.getServerName();
    const serverDescription = this.creationManager.getServerDescription();

    this.serverForm.patchValue({
      serverName: serverName,
      serverDescription: serverDescription
    });

    this.loadServerUrl();
    this.updateValidators();
    this.checkFormValidity();

    // Listen for form value changes
    this.serverForm.valueChanges.subscribe(() => {
      this.updateCreationManager();
      this.checkFormValidity();
    });

    // Listen for customServerUrl value changes specifically
    this.serverForm.get('customServerUrl')?.valueChanges.subscribe(() => {
      if (this.selectedServerUrl === '__other__') {
        this.onServerUrlChange();
      }
    });

    this.basicForm.statusChanges.subscribe(() => {
      this.checkFormValidity();
    });
    this.bearerForm.statusChanges.subscribe(() => {
      this.checkFormValidity();
    });
  }

  get serverName(): string {
    return this.serverForm.get('serverName')?.value || '';
  }

  get serverDescription(): string {
    return this.serverForm.get('serverDescription')?.value || '';
  }

  onServerUrlChange() {
    console.log('Server URL changed:', this.selectedServerUrl);
    if (this.selectedServerUrl === '__other__') {
      this.creationManager.setServerUrl(this.serverForm.get('customServerUrl')?.value || '');
    } else {
      this.creationManager.setServerUrl(this.selectedServerUrl);
    }

    this.updateValidators();

    // Force validation check on custom URL field when switching to it
    if (this.selectedServerUrl === '__other__') {
      const customUrlControl = this.serverForm.get('customServerUrl');
      if (customUrlControl) {
        customUrlControl.markAsTouched();
      }
    }

    this.checkFormValidity();
  }

  onSecurityChange() {
    this.updateValidators();
    this.setSecurity();
    this.checkFormValidity();
  }

  private updateValidators() {
    const customServerUrlControl = this.serverForm.get('customServerUrl');

    if (this.selectedServerUrl === '__other__') {
      customServerUrlControl?.setValidators([
        Validators.required,
        Validators.pattern(
          '^(https?:\\/\\/)' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|localhost|' + // domain name or localhost
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$' // fragment locator
        )
      ]);
    } else {
      customServerUrlControl?.clearValidators();
    }
    customServerUrlControl?.updateValueAndValidity({ emitEvent: false });

    // Update security form validators based on selected security type
    if (this.selectedSecurityType === 'basic' && this.selectedCredentialType === 'static') {
      this.basicForm.get('username')?.setValidators([Validators.required]);
      this.basicForm.get('password')?.setValidators([Validators.required]);
    } else {
      this.basicForm.get('username')?.clearValidators();
      this.basicForm.get('password')?.clearValidators();
    }

    if (this.selectedSecurityType === 'bearer' && this.selectedCredentialType === 'static') {
      this.bearerForm.get('token')?.setValidators([Validators.required]);
    } else {
      this.bearerForm.get('token')?.clearValidators();
    }

    this.basicForm.get('username')?.updateValueAndValidity({ emitEvent: false });
    this.basicForm.get('password')?.updateValueAndValidity({ emitEvent: false });
    this.bearerForm.get('token')?.updateValueAndValidity({ emitEvent: false });
  }

  private loadServerUrl() {
    const serverUrl = this.creationManager.getServerUrl();
    if (serverUrl && this.existingServers.some((server) => server.url === serverUrl)) {
      this.selectedServerUrl = serverUrl;
    } else {
      this.selectedServerUrl = '__other__';
      this.serverForm.patchValue({
        customServerUrl: serverUrl || ''
      });
    }
  }

  private updateCreationManager() {
    this.creationManager.setServerName(this.serverName);
    this.creationManager.setServerDescription(this.serverDescription);

    if (this.selectedServerUrl === '__other__') {
      this.creationManager.setServerUrl(this.serverForm.get('customServerUrl')?.value || '');
    } else {
      this.creationManager.setServerUrl(this.selectedServerUrl);
    }
  }

  private checkFormValidity() {
    let isValid = this.serverForm.valid;

    // Check URL validity
    if (this.selectedServerUrl === '__other__') {
      const customUrlControl = this.serverForm.get('customServerUrl');
      isValid = isValid && customUrlControl !== null && customUrlControl.valid && !!customUrlControl.value;
    }

    // Check security credentials validity
    if (this.selectedSecurityType === 'basic' && this.selectedCredentialType === 'static') {
      isValid = isValid && this.basicForm.valid;
    } else if (this.selectedSecurityType === 'bearer' && this.selectedCredentialType === 'static') {
      isValid = isValid && this.bearerForm.valid;
    }

    console.log('Form validity:', isValid, {
      serverForm: this.serverForm.valid,
      customServerUrl: this.serverForm.get('customServerUrl')?.valid,
      basicForm: this.basicForm.valid,
      bearerForm: this.bearerForm.valid
    });

    // Emit the validation state
    this.onValidChange.emit(isValid);
  }

  private setSecurity() {
    let security: any = {
      isSecure: this.selectedSecurityType !== 'none',
      securityType: this.selectedSecurityType,
      value: {
        type: this.selectedCredentialType,
        credentials:
          this.selectedCredentialType === 'static' && this.selectedSecurityType === 'basic'
            ? {
                username: this.basicForm.get('username')?.value || '',
                password: this.basicForm.get('password')?.value || ''
              }
            : undefined,
        token:
          this.selectedCredentialType === 'static' && this.selectedSecurityType === 'bearer'
            ? this.bearerForm.get('token')?.value || ''
            : undefined,
        fromToolParameters:
          this.selectedCredentialType === 'dynamic'
            ? this.selectedSecurityType === 'bearer'
              ? {
                  token: {
                    name: '__auth_token__',
                    schema: {
                      type: 'string'
                    }
                  }
                }
              : this.selectedSecurityType === 'basic'
                ? {
                    username: {
                      name: '__auth_username__',
                      schema: {
                        type: 'string'
                      }
                    },
                    password: {
                      name: '__auth_password__',
                      schema: {
                        type: 'string'
                      }
                    }
                  }
                : undefined
            : undefined
      },
      authParamIn: 'header', // TODO: Make this configurable
      authParamName: 'Authorization' // TODO: Make this configurable
    };

    this.creationManager.setSecurity(security);
  }
}
