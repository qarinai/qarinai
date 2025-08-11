import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-server-security-part',
  imports: [FieldsetModule, RadioButtonModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './server-security-part.component.html',
  styleUrl: './server-security-part.component.scss'
})
export class ServerSecurityPartComponent {
  fb = inject(FormBuilder);

  selectedSecurityType: 'none' | 'basic' | 'bearer' = 'none';
  selectedCredentialType: 'static' | 'dynamic' = 'static';

  serverForm = this.fb.group({
    serverUrl: ['', [Validators.required, Validators.pattern('^(https?:\\/\\/)?[a-zA-Z0-9.-]+(:\\d+)?(\\/.*)?$')]]
  });

  basicForm = this.fb.group({
    username: ['', this.selectedCredentialType === 'static' ? Validators.required : []],
    password: ['', this.selectedCredentialType === 'static' ? Validators.required : []]
  });

  bearerForm = this.fb.group({
    token: ['', this.selectedCredentialType === 'static' ? Validators.required : []]
  });

  onSecurityChange() {
    this.updateValidators();
    this.setSecurity();
    this.checkFormValidity();
  }

  private updateValidators() {
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

    // this.creationManager.setSecurity(security);
  }

  private checkFormValidity() {
    let isValid = this.serverForm.valid;

    // Check URL validity

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
    // this.onValidChange.emit(isValid);
  }
}
