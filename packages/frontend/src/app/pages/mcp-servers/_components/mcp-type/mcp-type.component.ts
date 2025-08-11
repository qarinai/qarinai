import { Component, input } from '@angular/core';
import { McpAdapterServerType } from '../../_interfaces/mcp-server.interface';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-mcp-type',
  imports: [TagModule],
  templateUrl: './mcp-type.component.html',
  styleUrl: './mcp-type.component.scss'
})
export class McpTypeComponent {
  type = input<McpAdapterServerType>(McpAdapterServerType.Swagger);

  Type = McpAdapterServerType;
}
