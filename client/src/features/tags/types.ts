export type InputType = 'text' | 'checkbox' | 'list' | 'example' | 'group';

export type ListStyle = 'unordered' | 'ordered' | 'checked' | 'xml';

export interface ExampleItem {
  uuid: string;
  input: string;
  output: string;
}

export interface ListItem {
  uuid: string;
  text: string;
  checked: boolean;
}

export interface Tag {
  uuid: string;
  id: string;
  type: InputType;
  parentUuid: string | null;
  textValue: string;
  checkboxValue: boolean;
  listValue: ListItem[];
  listStyle: ListStyle;
  listChildName: string;
  exampleValue: ExampleItem[];
  pinned: boolean;
  disabled: boolean;
  static: boolean;
  notes: string;
}

export interface TagsState {
  byUuid: Record<string, Tag>;
  rootOrder: string[];
  childOrder: Record<string, string[]>;
}

export const REF_PREFIX = '{{ref:';
export const REF_SUFFIX = '}}';

export const REF_REGEX = /\{\{ref:([A-Za-z0-9_-]+)\}\}/g;

export const buildRefToken = (uuid: string): string => `${REF_PREFIX}${uuid}${REF_SUFFIX}`;
