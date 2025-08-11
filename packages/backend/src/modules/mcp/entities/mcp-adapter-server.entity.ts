import { Column, Entity, OneToMany } from 'typeorm';
import { IMcpServerSecurity } from '../interfaces/server-security.interface';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { McpAdapterTool } from './mcp-adapter-tool.entity';
import { McpAdapterServerType } from '../enums/mcp-adapter-server-types.enum';

@Entity()
export class McpAdapterServer extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: McpAdapterServerType,
    default: McpAdapterServerType.Swagger,
  })
  type: McpAdapterServerType;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  security: IMcpServerSecurity;

  @OneToMany(() => McpAdapterTool, (tool) => tool.server)
  tools: McpAdapterTool[];
}
