// Global declarations for commonly used Foundry constructors and types
// These are available globally without imports

declare global {
  // Data Field constructors (values)
  const BooleanField: typeof foundry.data.fields.BooleanField;
  const NumberField: typeof foundry.data.fields.NumberField;
  const StringField: typeof foundry.data.fields.StringField;
  const ArrayField: typeof foundry.data.fields.ArrayField;
  const SchemaField: typeof foundry.data.fields.SchemaField;
  const EmbeddedDataField: typeof foundry.data.fields.EmbeddedDataField;
  const HTMLField: typeof foundry.data.fields.HTMLField;
  const FilePathField: typeof foundry.data.fields.FilePathField;

  // Data Field types (for use in type positions)
  type BooleanField = foundry.data.fields.BooleanField;
  type NumberField = foundry.data.fields.NumberField;
  type StringField = foundry.data.fields.StringField;
  type ArrayField<T> = foundry.data.fields.ArrayField<T>;
  type SchemaField<T> = foundry.data.fields.SchemaField<T>;
  type EmbeddedDataField<T extends abstract new (...args: any[]) => any> = foundry.data.fields.EmbeddedDataField<T>;
  type HTMLField = foundry.data.fields.HTMLField;
  type FilePathField = foundry.data.fields.FilePathField;

  // Abstract class constructors (values)
  const TypeDataModel: typeof foundry.abstract.TypeDataModel;
  const DataModel: typeof foundry.abstract.DataModel;

  // Document constructors (values)
  const BaseActor: typeof foundry.documents.BaseActor;
  const BaseItem: typeof foundry.documents.BaseItem;

  // Document types (for use in type positions)
  type BaseActor = foundry.documents.BaseActor;
  type BaseItem = foundry.documents.BaseItem;
}

export {};
