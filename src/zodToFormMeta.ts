import { z } from 'zod';
import type { FormMeta, FieldMeta } from './types';

export function toLabel(str: string): string {
  if (!str) return '';
  const words = str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function unwrapZodType(schema: z.ZodTypeAny): {
  unwrapped: z.ZodTypeAny;
  required: boolean;
  defaultValue?: any;
  description?: string;
} {
  let current = schema;
  let required = true;
  let defaultValue: any = undefined;
  const description = schema.description;

  while (true) {
    const typeName = current._def.typeName;
    if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
      required = false;
      current = (current as any).unwrap();
    } else if (typeName === 'ZodDefault') {
      defaultValue = (current as any)._def.defaultValue();
      current = (current as any)._def.innerType;
    } else if (typeName === 'ZodEffects') {
      current = (current as any).innerType();
    } else {
      break;
    }
  }

  return { unwrapped: current, required, defaultValue, description };
}

/**
 * Recursively parses a Zod schema to produce a UI-friendly form metadata object.
 *
 * @param schema The Zod schema to inspect.
 * @param fieldName The original name of the field (used to generate human-readable labels).
 * @returns A structured metadata configuration for generating form fields.
 */
export function zodToFormMeta(schema: z.ZodTypeAny, fieldName: string = ''): FormMeta {
  const { unwrapped, required, defaultValue, description } = unwrapZodType(schema);
  const typeName = unwrapped._def.typeName;
  const label = fieldName ? toLabel(fieldName) : '';

  const meta: FieldMeta = {
    type: 'text',
    label,
    required,
  };

  if (defaultValue !== undefined) {
    meta.defaultValue = defaultValue;
  }
  if (description !== undefined) {
    meta.description = description;
  }

  if (typeName === 'ZodString') {
    meta.type = 'text';
    const checks = (unwrapped as z.ZodString)._def.checks;
    const validations: any = {};
    for (const check of checks) {
      if (check.kind === 'email') {
        meta.type = 'email';
        validations.email = true;
      } else if (check.kind === 'url') {
        meta.type = 'url';
        validations.url = true;
      } else if (check.kind === 'uuid') {
        validations.uuid = true;
      } else if (check.kind === 'min') {
        validations.min = { value: check.value, message: check.message };
      } else if (check.kind === 'max') {
        validations.max = { value: check.value, message: check.message };
      } else if (check.kind === 'regex') {
        validations.regex = { value: check.regex.source, message: check.message };
      }
    }
    if (Object.keys(validations).length > 0) {
      meta.validations = validations;
    }
  } else if (typeName === 'ZodNumber') {
    meta.type = 'number';
    const checks = (unwrapped as z.ZodNumber)._def.checks;
    const validations: any = {};
    for (const check of checks) {
      if (check.kind === 'min') {
        validations.min = { value: check.value, message: check.message };
      } else if (check.kind === 'max') {
        validations.max = { value: check.value, message: check.message };
      }
    }
    if (Object.keys(validations).length > 0) {
      meta.validations = validations;
    }
  } else if (typeName === 'ZodBoolean') {
    meta.type = 'checkbox';
  } else if (typeName === 'ZodDate') {
    meta.type = 'date';
  } else if (typeName === 'ZodEnum') {
    meta.type = 'select';
    meta.options = (unwrapped as z.ZodEnum<any>)._def.values;
  } else if (typeName === 'ZodNativeEnum') {
    meta.type = 'select';
    const enumObj = (unwrapped as z.ZodNativeEnum<any>)._def.values;
    meta.options = Object.values(enumObj).filter((v) => typeof v === 'string') as string[];
  } else if (typeName === 'ZodObject') {
    meta.type = 'object';
    const shape = (unwrapped as z.ZodObject<any>).shape;
    const fields: Record<string, FieldMeta> = {};
    for (const key of Object.keys(shape)) {
      fields[key] = zodToFormMeta(shape[key], key);
    }
    meta.fields = fields;
  } else if (typeName === 'ZodArray') {
    meta.type = 'array';
    meta.element = zodToFormMeta((unwrapped as z.ZodArray<any>).element, '');
  }

  return meta;
}
