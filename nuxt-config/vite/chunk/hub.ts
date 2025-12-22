/**
 * Hub app chunk configuration overrides.
 *
 * Hub uses the shared chunk configuration without modifications.
 * This file exists for consistency and future extensibility.
 */

import type { ChunkGroup } from './bridge'

/**
 * Hub-specific chunk overrides.
 * Currently empty - hub uses shared config as-is.
 */
export function getHubChunkOverrides(): ChunkGroup[] {
  return []
}
