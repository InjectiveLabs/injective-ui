#!/bin/bash

# Script to precisely rename variables with the patterns:
# 1. variableNameTo(ChainFormat|HumanReadable|BigNumber) → variableNamein(ChainFormat|HumanReadable|BigNumber)
# 2. variableNameIn(ChainFormat|HumanReadable|BigNumber) → variableNamein(ChainFormat|HumanReadable|BigNumber)

echo "Starting precise variable renaming..."

# Find all TypeScript files in the injective-helix directory, excluding node_modules
find ../injective-helix -name "*.ts" -type f ! -path "*/node_modules/*" | while read -r file; do
    # Check if file contains variables with the patterns we're looking for
    if grep -q -E "\b[a-zA-Z][a-zA-Z0-9_]*(To|In)(ChainFormat|HumanReadable|BigNumber)\b" "$file"; then
        echo "Processing file: $file"
        
        # Create a backup of the original file
        cp "$file" "$file.bak"
        
        # Process the file with perl for more precise pattern matching
        perl -i -pe '
            # Replace variables ending with ToBigNumber, ToHumanReadable, ToChainFormat
            s/\b([a-zA-Z][a-zA-Z0-9_]*)To(BigNumber|HumanReadable|ChainFormat)\b/$1in$2/g;
            # Replace variables with InBigNumber, InHumanReadable, InChainFormat
            s/\b([a-zA-Z][a-zA-Z0-9_]*)In(BigNumber|HumanReadable|ChainFormat)\b/$1in$2/g;
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
