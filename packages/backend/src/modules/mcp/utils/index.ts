import { z } from 'zod/v3';
import { JSONSchema } from 'zod/v4/core/json-schema';

export const paramTypeToZodType = (type: string) => {
  switch (type) {
    case 'string':
      return 'string';
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return 'enum';
    default:
      console.warn(`Unknown type ${type}, defaulting to string`);
      return 'string';
  }
};

export const convertJsonSchemaToZod = (
  jsonSchema: JSONSchema & { isRequired?: boolean },
): z.ZodTypeAny => {
  let r: z.ZodTypeAny = z.any();
  switch (jsonSchema.type) {
    case 'string':
      r = z.string();
      break;
    case 'number':
      r = z.number();
      break;
    case 'boolean':
      r = z.boolean();
      break;
    case 'integer':
      r = z.number().int();
      break;
    case 'array':
      r = z.array(convertJsonSchemaToZod(jsonSchema.items as JSONSchema));
      break;
    case 'object':
      r = z.object(
        Object.entries(jsonSchema.properties || {}).reduce(
          (acc, [key, value]) => {
            acc[key] = convertJsonSchemaToZod({
              ...(value as JSONSchema),
              isRequired: jsonSchema.required?.includes(key),
            });
            return acc;
          },
          {},
        ),
      );
      break;
    case 'null':
      r = z.null();
      break;
    default:
      throw new Error(`Unsupported JSON Schema type: ${jsonSchema.type}`);
  }
  if (jsonSchema.type === 'string' && jsonSchema.enum) {
    r = z.enum(jsonSchema.enum as [string, ...string[]]);
  }

  if (jsonSchema.default !== undefined) {
    r = r.default(jsonSchema.default);
  }

  if (
    ['number', 'integer'].includes(jsonSchema.type) &&
    jsonSchema.minimum !== undefined
  ) {
    r = (r as z.ZodNumber).min(jsonSchema.minimum);
  }

  if (
    ['number', 'integer'].includes(jsonSchema.type) &&
    jsonSchema.maximum !== undefined
  ) {
    r = (r as z.ZodNumber).max(jsonSchema.maximum);
  }

  if (jsonSchema.description) {
    r = r.describe(jsonSchema.description);
  }

  if (!jsonSchema.isRequired) {
    r = r.optional();
  }

  return r;
};
