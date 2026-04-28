/** Maximum depth (0-based root) before child recursion is blocked. */
export const MAX_METADATA_TREE_DEPTH = 10;

const emptyAncestors: ReadonlySet<string> = new Set();

export function resolveMetadataAncestorIds(
  ancestorIds?: ReadonlySet<string>,
): ReadonlySet<string> {
  return ancestorIds ?? emptyAncestors;
}

/**
 * Path from root to the current node (inclusive). Used for cycle detection on children.
 */
export function extendMetadataAncestorIds(
  ancestorIds: ReadonlySet<string>,
  nodeId: string,
): Set<string> {
  const next = new Set(ancestorIds);
  next.add(nodeId);
  return next;
}
