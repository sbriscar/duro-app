#!/bin/bash

# Create backup directory with timestamp
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup core files
cp -r src/app/(auth) "$BACKUP_DIR/"
cp -r src/components "$BACKUP_DIR/"
cp -r src/contexts "$BACKUP_DIR/"
cp -r src/lib "$BACKUP_DIR/"
cp -r src/types "$BACKUP_DIR/"

# Backup config files
cp .env.local "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"

# Create backup manifest
echo "Backup created at $(date)" > "$BACKUP_DIR/manifest.txt"
echo "Files included:" >> "$BACKUP_DIR/manifest.txt"
find "$BACKUP_DIR" -type f -not -name "manifest.txt" >> "$BACKUP_DIR/manifest.txt" 