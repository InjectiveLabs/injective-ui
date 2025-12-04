#!/bin/bash

# Script to rename variables with two patterns:
# 1. variableNameTo(ChainFormat|HumanReadable|BigNumber) → variableNamein(ChainFormat|HumanReadable|BigNumber)
# 2. variableNameIn(ChainFormat|HumanReadable|BigNumber) → variableNamein(ChainFormat|HumanReadable|BigNumber)

echo "Starting variable renaming for both patterns..."

# Find all TypeScript files in the injective-helix directory, excluding node_modules
find ../injective-helix -name "*.ts" -type f ! -path "*/node_modules/*" | while read -r file; do
    # Check if file contains variables with either pattern we're looking for
    if grep -q -E "\b\w+(To|In)(ChainFormat|HumanReadable|BigNumber)\b" "$file"; then
        echo "Processing file: $file"
        
        # Create a temporary file
        temp_file=$(mktemp)
        
        # Process the file to rename variables with both patterns
        sed -E -e 's/\b([a-zA-Z0-9_]+)To(ChainFormat|HumanReadable|BigNumber)\b/\1in\2/g' \
               -e 's/\b([a-zA-Z0-9_]+)In(ChainFormat|HumanReadable|BigNumber)\b/\1in\2/g' \
               "$file" > "$temp_file"
        
        # Replace the original file with the modified one
        mv "$temp_file" "$file"
        
        echo "Updated variables in $file"
    fi
done

echo "Variable renaming completed!"
