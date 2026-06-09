import { describe, it, expect } from 'bun:test';
import { z } from 'zod';
import { zodToFormMeta, toLabel } from '../src/zodToFormMeta';

describe('toLabel', () => {
  it('should transform camelCase/snake_case to readable Title Case labels', () => {
    expect(toLabel('firstName')).toBe('First Name');
    expect(toLabel('phone_number')).toBe('Phone Number');
    expect(toLabel('kebab-case-field')).toBe('Kebab Case Field');
  });
});

describe('zodToFormMeta', () => {
  it('should parse simple ZodString schemas with constraints', () => {
    const emailSchema = z.string().email().min(5).max(100);
    const meta = zodToFormMeta(emailSchema, 'userEmail');

    expect(meta.type).toBe('email');
    expect(meta.label).toBe('User Email');
    expect(meta.required).toBe(true);
    expect(meta.validations?.email).toBe(true);
    expect(meta.validations?.min?.value).toBe(5);
    expect(meta.validations?.max?.value).toBe(100);
  });

  it('should parse optional and nullable schemas correctly', () => {
    const optSchema = z.string().optional();
    const nullSchema = z.string().nullable();

    expect(zodToFormMeta(optSchema, 'name').required).toBe(false);
    expect(zodToFormMeta(nullSchema, 'name').required).toBe(false);
  });

  it('should parse defaultValue and description properties', () => {
    const schema = z.string().default('hello').describe('A greeting message');
    const meta = zodToFormMeta(schema, 'greet');

    expect(meta.defaultValue).toBe('hello');
    expect(meta.description).toBe('A greeting message');
  });

  it('should parse ZodNumber schemas', () => {
    const ageSchema = z.number().min(18).max(99);
    const meta = zodToFormMeta(ageSchema, 'user_age');

    expect(meta.type).toBe('number');
    expect(meta.validations?.min?.value).toBe(18);
    expect(meta.validations?.max?.value).toBe(99);
  });

  it('should parse ZodEnum and ZodNativeEnum schemas', () => {
    const roleSchema = z.enum(['admin', 'editor', 'user']);
    const meta = zodToFormMeta(roleSchema, 'role');

    expect(meta.type).toBe('select');
    expect(meta.options).toEqual(['admin', 'editor', 'user']);

    enum Status {
      Active = 'active',
      Inactive = 'inactive',
    }
    const statusSchema = z.nativeEnum(Status);
    const nativeMeta = zodToFormMeta(statusSchema, 'status');

    expect(nativeMeta.type).toBe('select');
    expect(nativeMeta.options).toEqual(['active', 'inactive']);
  });

  it('should parse nested ZodObject schemas recursively', () => {
    const userProfile = z.object({
      username: z.string().min(3),
      age: z.number().optional(),
      settings: z.object({
        theme: z.enum(['dark', 'light']).default('dark'),
      }),
    });

    const meta = zodToFormMeta(userProfile, 'profile');

    expect(meta.type).toBe('object');
    expect(meta.fields?.username.type).toBe('text');
    expect(meta.fields?.username.required).toBe(true);
    expect(meta.fields?.age.required).toBe(false);
    expect(meta.fields?.settings.type).toBe('object');
    expect(meta.fields?.settings.fields?.theme.defaultValue).toBe('dark');
    expect(meta.fields?.settings.fields?.theme.options).toEqual(['dark', 'light']);
  });

  it('should parse ZodArray schemas', () => {
    const listSchema = z.array(z.string().email());
    const meta = zodToFormMeta(listSchema, 'emails');

    expect(meta.type).toBe('array');
    expect(meta.element?.type).toBe('email');
    expect(meta.element?.required).toBe(true);
  });
});
