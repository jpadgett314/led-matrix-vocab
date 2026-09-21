#!/usr/bin/env bash

INPUT="./app/public/fonts/JF-Dot-jiskan16-inverted-bitdepth1-spritesheet.png"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP="${INPUT}.${TIMESTAMP}.bak"
OUTPUT="${INPUT}"

if [[ ! -f "$INPUT" ]]; then
    echo "Error: File '$INPUT' not found." >&2
    exit 1
fi

echo "Backing up '$INPUT' to '$BACKUP'..."

if ! mv "$INPUT" "$BACKUP"; then
    echo "Error: Failed to move/rename the original file for backup." >&2
    exit 1
fi

echo "Converting '$BACKUP' to 1-bit grayscale..."

if ! magick "$BACKUP" -colorspace gray -depth 1 -define png:include-chunk=none "$OUTPUT"; then
    echo "Error: ImageMagick conversion failed." >&2
    echo "Restoring original file from backup..."
    mv "$BACKUP" "$INPUT"
    exit 1
fi

