#!/bin/bash

# Script to fix variables that should have capital "In" instead of "in"
# Changes pattern: variableNamein(BigNumber|HumanReadable|ChainFormat) → variableNameIn(BigNumber|HumanReadable|ChainFormat)

echo "Starting fix for capital 'In' variables..."

# Find all TypeScript files in the injective-helix directory, excluding node_modules
find ../injective-helix -name "*.ts" -type f ! -path "*/node_modules/*" | while read -r file; do
    # Check if file contains variables with the pattern we're looking for
    if grep -q -E "\b[a-zA-Z][a-zA-Z0-9_]*in(BigNumber|HumanReadable|ChainFormat)\b" "$file"; then
        echo "Processing file: $file"
        
        # Create a backup of the original file
        cp "$file" "$file.bak"
        
        # Process the file with perl for more precise pattern matching
        perl -i -pe '
            # Replace variables ending with inBigNumber, inHumanReadable, inChainFormat with InBigNumber, InHumanReadable, InChainFormat
            s/\b([a-zA-Z][a-zA-Z0-9_]*)in(BigNumber|HumanReadable|ChainFormat)\b/$1In$2/g;
        ' "$file"
        
        # Check if any changes were made
        if ! diff -q "$file" "$file.bak" > /dev/null; then
            echo "Updated variables in $file"
        else
            echo "No changes needed in $file"
        fi
        
        # Remove the backup file
        rm "$file.bak"
    fi
done

echo "Variable fixing completed!"
