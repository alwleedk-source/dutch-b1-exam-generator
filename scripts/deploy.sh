#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Run migrations
echo "📊 Running database migrations..."
pnpm tsx server/migrate.ts

# Import dictionary
echo "📚 Importing B1 dictionary..."
if [ -f "/home/ubuntu/b1_dictionary_complete.json" ]; then
  pnpm tsx server/importDictionary.ts
else
  echo "⚠️  Dictionary file not found, skipping import"
fi

echo "✅ Deployment completed!"
