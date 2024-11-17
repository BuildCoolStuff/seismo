#!/bin/bash

# Replace with your namespace name
NAMESPACE="SEISMO_STORE"

# List all keys and delete them
wrangler kv:key list --binding=$NAMESPACE | jq -r '.[].name' | while read -r key; do
    echo "Deleting key: $key"
    wrangler kv:key delete --binding=$NAMESPACE "$key"
done

echo "All keys have been deleted from $NAMESPACE"