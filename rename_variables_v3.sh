#!/bin/bash

# Script to rename variables ending with toBigNumber, toHumanReadable, and toChainFormat
# to their in* equivalents in injective-helix repository

# Path to the injective-helix repository
REPO_PATH="../injective-helix"

# Find all TypeScript and JavaScript files (excluding node_modules and cache directories)
find "$REPO_PATH" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.cache/*" \
  -not -path "*/dist/*" \
  -not -path "*/.nuxt/*" \
  -not -path "*/.output/*" | while read -r file; do
  
  echo "Processing $file..."
  
  # Rename variables ending with toBigNumber to inBigNumber
  sed -i '' -E 's/\b([a-zA-Z_][a-zA-Z0-9_]*)toBigNumber\b/\1inBigNumber/g' "$file"
  
  # Rename variables ending with toHumanReadable to inHumanReadable
  sed -i '' -E 's/\b([a-zA-Z_][a-zA-Z0-9_]*)toHumanReadable\b/\1inHumanReadable/g' "$file"
  
  # Rename variables ending with toChainFormat to inChainFormat
  sed -i '' -E 's/\b([a-zA-Z_][a-zA-Z0-9_]*)toChainFormat\b/\1inChainFormat/g' "$file"
  
  # Also handle variables that already have the "In" prefix but need to be changed to "in"
  sed -i '' -E 's/\b([a-zA-Z_][a-zA-Z0-9_]*)InBigNumber\b/\1inBigNumber/g' "$file"
  sed -i '' -E 's/\b([a-zA-Z_][a-zA-Z0-9_]*)InHumanReadable\b/\1inHumanReadable/g' "$file"
  sed -i '' -E 's/\b([a-zA-Z_][a-zA-Z0-9_]*)InChainFormat\b/\1inChainFormat/g' "$file"
done

echo "Renaming complete!"
