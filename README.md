# @rafaeldasilvadeveloper/zod-meta-form

A framework-agnostic generator of Form UI metadata from Zod schemas, converting schemas into dynamic, client-ready forms.

[![NPM Version](https://img.shields.io/npm/v/@rafaeldasilvadeveloper/zod-meta-form.svg?style=flat-square)](https://www.npmjs.com/package/@rafaeldasilvadeveloper/zod-meta-form)
[![Discord Support](https://img.shields.io/discord/1111111111?color=7289da&label=Discord&logo=discord&style=flat-square)](https://discord.gg/7Fw7snafYS)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-blueviolet.svg?style=flat-square)](https://www.npmjs.com/package/@rafaeldasilvadeveloper/zod-meta-form)

## Features

*   🎯 **Framework Agnostic**: Outputs pure JSON-serializable UI form trees. Works with React, Vue, Svelte, Angular, or Vanilla JS.
*   🔄 **Recursive Parsing**: Deeply inspects nested `ZodObject` and `ZodArray` schemas.
*   🏷️ **Auto-Label Generation**: Automatically converts camelCase, snake_case, and kebab-case field names into clean, readable Title Case labels.
*   🛠️ **Zod Constraint Mapping**: Translates string and number constraints (email, url, uuid, min, max, regex) into form validation rules.
*   🎛️ **Supports Enums**: Converts Zod `enum` and `nativeEnum` options directly into dropdown options lists.

## Installation

```bash
npm install @rafaeldasilvadeveloper/zod-meta-form zod
```

## Usage

```typescript
import { z } from 'zod';
import { zodToFormMeta } from '@rafaeldasilvadeveloper/zod-meta-form';

// 1. Define your Zod schema
const signupSchema = z.object({
  firstName: z.string().min(2).describe('Your first name'),
  email: z.string().email(),
  role: z.enum(['developer', 'designer', 'manager']).default('developer'),
  subscribeToNewsletter: z.boolean().optional(),
});

// 2. Generate form UI metadata
const formMeta = zodToFormMeta(signupSchema);

console.log(JSON.stringify(formMeta, null, 2));
```

### Output Form Metadata Structure

```json
{
  "type": "object",
  "label": "",
  "required": true,
  "fields": {
    "firstName": {
      "type": "text",
      "label": "First Name",
      "required": true,
      "description": "Your first name",
      "validations": {
        "min": { "value": 2 }
      }
    },
    "email": {
      "type": "email",
      "label": "Email",
      "required": true,
      "validations": {
        "email": true
      }
    },
    "role": {
      "type": "select",
      "label": "Role",
      "required": true,
      "defaultValue": "developer",
      "options": ["developer", "designer", "manager"]
    },
    "subscribeToNewsletter": {
      "type": "checkbox",
      "label": "Subscribe To Newsletter",
      "required": false
    }
  }
}
```

## API

### `zodToFormMeta(schema: z.ZodTypeAny, fieldName?: string): FormMeta`
Recursively generates form controls, type mappings, validation rules, default values, options, and descriptions from a Zod schema.

### `toLabel(fieldName: string): string`
Converts `camelCase`, `snake_case`, and `kebab-case` string patterns into standard capitalized labels.

## Support

For support, questions, or discussions, join our Discord server:

[![Discord Server](https://img.shields.io/discord/1111111111?color=7289da&label=Discord&logo=discord&style=for-the-badge)](https://discord.gg/7Fw7snafYS)

## License
MIT
