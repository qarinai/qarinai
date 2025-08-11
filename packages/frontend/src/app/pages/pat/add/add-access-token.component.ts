import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PersonalAccessTokenBackendService } from '../_services/personal-access-token-backend.service';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-add-access-token',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    DialogModule
  ],
  templateUrl: './add-access-token.component.html',
  styleUrl: './add-access-token.component.scss'
})
export class AddAccessTokenComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly patBackendService = inject(PersonalAccessTokenBackendService);
  private readonly messageService = inject(MessageService);

  dialogVisible = signal<boolean>(false);
  createdToken = signal<string | null>(null);

  minDate = new Date(new Date().setDate(new Date().getDate() + 1));

  accessTokenForm = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    expirationDate: this.fb.control('', { nonNullable: true, validators: [Validators.required] })
  });

  ngOnInit(): void {}

  onCreateClick() {
    if (this.accessTokenForm.invalid) {
      this.accessTokenForm.markAllAsTouched();
      this.accessTokenForm.updateValueAndValidity();
      this.messageService.add({
        severity: 'error',
        summary: 'Form Error',
        detail: 'Please fill in all required fields correctly.'
      });

      return;
    }

    this.patBackendService
      .createToken(this.accessTokenForm.value as Required<typeof this.accessTokenForm.value>)
      .subscribe({
        next: (token) => {
          // this.router.navigate(['/pages/personal-access-tokens']);
          this.createdToken.set(token.token);
          this.dialogVisible.set(true);
        },
        error: (error) => {
          console.error('Error creating PAT:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Creation Error',
            detail: 'Failed to create Personal Access Token. Please try again.'
          });
        }
      });
  }

  onDialogShow() {
    const token = this.createdToken();
    if (window?.navigator?.clipboard && token) {
      const elm = document.getElementById('createdTokenText') as HTMLInputElement;
      elm.focus();
      elm.select();
      elm.setSelectionRange(0, 99999); // For mobile devices
      navigator.clipboard
        .writeText(token)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Token Copied',
            detail: 'Personal Access Token has been copied to clipboard.'
          });
        })
        .catch((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Copy Failed',
            detail: 'Failed to copy Personal Access Token to clipboard.'
          });
        });
    }
  }

  onDialogHide() {
    this.router.navigate(['/pages/personal-access-tokens']);
  }
}
