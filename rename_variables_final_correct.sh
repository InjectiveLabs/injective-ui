#!/bin/bash

# Script to precisely rename variables with the pattern:
# variableNameTo(ChainFormat|HumanReadable|BigNumber) → variableNamein(ChainFormat|HumanReadable|BigNumber)
# This script will NOT touch variables that already have capital "In"

echo "Starting final correct variable renaming..."

# Find all TypeScript files in the injective-helix directory, excluding node_modules
find ../injective-helix -name "*.ts" -type f ! -path "*/node_modules/*" | while read -r file; do
    # Check if file contains variables with the pattern we're looking for
    if grep -q -E "\b[a-zA-Z][a-zA-Z0-9_]*To(BigNumber|HumanReadable|ChainFormat)\b" "$file"; then
        echo "Processing file: $file"
        
        # Create a backup of the original file
        cp "$file" "$file.bak"
        
        # Process the file with perl for more precise pattern matching
        # Only replace variables ending with To(BigNumber|HumanReadable|ChainFormat)
        perl -i -pe '
            # Replace variables ending with ToBigNumber, ToHumanReadable, ToChainFormat with inBigNumber, inHumanReadable, inChainFormat
            s/\b([a-zA-Z][a-zA-Z0-9_]*)To(BigNumber|HumanReadable|ChainFormat)\b/$1in$2/g;
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

echo "Variable renaming completed!"
