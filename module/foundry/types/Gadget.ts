// types/Gadget.ts
// types/Gadget.ts
import type { ConfiguredGadget } from "fvtt-types/configuration";
import type { documents } from "#client-esm/client.d.mts";
import type Document from "#common/abstract/document.d.mts";
import type { DataSchema } from "#common/data/fields.d.mts";
import fields = foundry.data.fields;

declare global {
  namespace Gadget {
    type Name = "Gadget";
    type SubType = Game.Model.TypeNames<Name>;
    type Parent = null; // or Actor/Item if embedded in the future

    interface Metadata extends Document.Metadata.Default {
      name: "Gadget";
      collection: "gadgets";
      indexed: true;
      hasTypeData: true;
      label: "Gadget";
      labelPlural: "Gadgets";
      permissions: {
        create: "ITEM_CREATE";
      };
      embedded: {}; // or ActiveEffect, etc.
    }

    interface Schema extends DataSchema {
      _id: fields.DocumentIdField;
      name: fields.StringField<{ required: true }>;
      type: fields.StringField;
      img: fields.FilePathField;
      system: fields.ObjectField<Record<string, unknown>>;
    }

    interface CreateData extends fields.SchemaField.CreateData<Schema> {}
    interface InitializedData extends fields.SchemaField.InitializedData<Schema> {}
    interface UpdateData extends fields.SchemaField.UpdateData<Schema> {}
    interface Source extends fields.SchemaField.SourceData<Schema> {}

    type Stored = Document.Stored<OfType<SubType>>;
    type OfType<Type extends SubType> = Document.Internal.OfType<ConfiguredGadget<Type>, Gadget<Type>>;
  }

  class Gadget<out SubType extends Gadget.SubType = Gadget.SubType> extends ClientDocumentMixin(
    foundry.documents.BaseGadget,
  )<SubType> {
    constructor(...args: Document.ConstructorParameters<Gadget.CreateData, null>);
    getRollData(): Record<string, unknown>;
  }
}

import fields = foundry.data.fields;

declare global {
  namespace Gadget {
    type Name = "Gadget";
    type SubType = Game.Model.TypeNames<Name>;
    type Parent = null; // or Actor/Item if embedded in the future

    interface Metadata extends Document.Metadata.Default {
      name: "Gadget";
      collection: "gadgets";
      indexed: true;
      hasTypeData: true;
      label: "Gadget";
      labelPlural: "Gadgets";
      permissions: {
        create: "ITEM_CREATE";
      };
      embedded: {}; // or ActiveEffect, etc.
    }

    interface Schema extends DataSchema {
      _id: fields.DocumentIdField;
      name: fields.StringField<{ required: true }>;
      type: fields.StringField;
      img: fields.FilePathField;
      system: fields.ObjectField<Record<string, unknown>>;
    }

    interface CreateData extends fields.SchemaField.CreateData<Schema> {}
    interface InitializedData extends fields.SchemaField.InitializedData<Schema> {}
    interface UpdateData extends fields.SchemaField.UpdateData<Schema> {}
    interface Source extends fields.SchemaField.SourceData<Schema> {}

    type Stored = Document.Stored<OfType<SubType>>;
    type OfType<Type extends SubType> = Document.Internal.OfType<ConfiguredGadget<Type>, Gadget<Type>>;
  }

  class Gadget<out SubType extends Gadget.SubType = Gadget.SubType> extends ClientDocumentMixin(
    foundry.documents.BaseGadget,
  )<SubType> {
    constructor(...args: Document.ConstructorParameters<Gadget.CreateData, null>);
    getRollData(): Record<string, unknown>;
  }
}
