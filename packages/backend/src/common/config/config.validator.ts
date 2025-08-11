import { plainToInstance } from 'class-transformer';
import { ConfigSchema } from './config.schema';
import { validateSync } from 'class-validator';

export function validateConfig(config: Record<string, unknown>): ConfigSchema {
  const validatedConfig = plainToInstance(ConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}
