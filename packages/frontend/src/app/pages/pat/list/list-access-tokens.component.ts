import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { IPersonalAccessToken } from '../_interfaces/personal-access-token.interface';
import { PersonalAccessTokenBackendService } from '../_services/personal-access-token-backend.service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-list-access-tokens',
  imports: [TableModule, ButtonModule, ToolbarModule, CommonModule, RouterModule],
  templateUrl: './list-access-tokens.component.html',
  styleUrl: './list-access-tokens.component.scss'
})
export class ListAccessTokensComponent implements OnInit {
  private patBackendService = inject(PersonalAccessTokenBackendService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  patList = signal<IPersonalAccessToken[]>([]);
  patListLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadPATList();
  }

  onAddClick() {
    this.router.navigate(['/pages/personal-access-tokens/add']);
  }

  onDeleteClick(token: IPersonalAccessToken) {
    if (confirm(`Are you sure you want to delete the token "${token.name}"?`)) {
      this.patListLoading.set(true);
      this.patBackendService.deleteToken(token.id).subscribe({
        next: () => {
          this.patListLoading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Token Deleted',
            detail: `Personal Access Token "${token.name}" deleted successfully.`
          });
        },
        error: (error) => {
          console.error('Error deleting PAT:', error);
        },
        complete: () => {
          this.loadPATList();
        }
      });
    }
  }

  private loadPATList() {
    this.patListLoading.set(true);
    this.patBackendService.listTokens().subscribe({
      next: (tokens) => {
        this.patList.set(tokens);
      },
      error: (error) => {
        console.error('Error loading PAT list:', error);
      },
      complete: () => {
        this.patListLoading.set(false);
      }
    });
  }
}
