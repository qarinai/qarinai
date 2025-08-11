import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-add-mcp-server',
  imports: [ButtonModule, RouterModule],
  providers: [],
  templateUrl: './add-mcp-server.component.html',
  styleUrl: './add-mcp-server.component.scss'
})
export class AddMcpServerComponent {}
