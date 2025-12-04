#!/bin/bash

# Script to rename variables with pattern variableNameIn(ChainFormat|HumanReadable|BigNumber) 
# to variableNamein(ChainFormat|HumanReadable|BigNumber)

echo "Starting variable renaming for In* pattern..."

# Find all TypeScript files in the injective-helix directory
find ../injective-helix -name "*.ts" -type f | while read -r file; do
    # Check if file contains variables with the pattern we're looking for
    if grep -q "\b\w\+In\(ChainFormat\|HumanReadable\|BigNumber\)\b" "$file"; then
        echo "Processing file: $file"
        
        # Create a temporary file
        temp_file=$(mktemp)
        
        # Process the file to rename variables
        sed -E 's/\b([a-zA-Z0-9_]+)In(ChainFormat|HumanReadable|BigNumber)\b/\1in\2/g' "$file" > "$temp_file"
        
        # Replace the original file with the modified one
        mv "$temp_file" "$file"
        
        echo "Updated variables in $file"
    fi
done

echo "Variable renaming completed!"
