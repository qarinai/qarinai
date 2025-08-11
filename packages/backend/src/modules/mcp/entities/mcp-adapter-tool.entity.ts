import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { McpToolTypes } from '../enums/mcp-tool-types.enum';
import { McpDataDefinition } from '../interfaces/mcp.interfaces';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { McpAdapterServer } from './mcp-adapter-server.entity';

@Unique('UQ_mcp_tool_server_id_name', ['serverId', 'name'])
@Entity()
export class McpAdapterTool extends AbstractEntity {
  @Column({
    name: 'server_id',
    type: 'uuid',
    nullable: false,
  })
  serverId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: McpToolTypes,
    enumName: 'enum_mcp_tool_types',
    default: McpToolTypes.RestApiCall,
  })
  type: McpToolTypes;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  toolData: McpDataDefinition;

  @ManyToOne(() => McpAdapterServer)
  @JoinColumn({ name: 'server_id' })
  server: McpAdapterServer;
}
