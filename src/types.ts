export type FieldType =
  | 'text'
  | 'email'
  | 'url'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'object'
  | 'array';

export interface ValidationRule {
  value: any;
  message?: string;
}

export interface FieldMeta {
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[];
  validations?: {
    min?: ValidationRule;
    max?: ValidationRule;
    email?: boolean;
    url?: boolean;
    uuid?: boolean;
    regex?: ValidationRule;
  };
  fields?: Record<string, FieldMeta>;
  element?: FieldMeta;
}

export type FormMeta = FieldMeta;
