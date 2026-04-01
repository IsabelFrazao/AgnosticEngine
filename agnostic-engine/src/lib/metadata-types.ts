export type MetadataSchemaItem = {
  id: string;
  type: string;
  props?: Record<string, unknown> & { metadata?: Record<string, unknown> };
  permissions?: string[];
};

export type MetadataComponentProps = {
  metadata?: Record<string, unknown>;
  requiredPermissions?: string[];
};
