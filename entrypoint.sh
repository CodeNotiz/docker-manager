#!/bin/sh

SECRET_FILE="/app/data/jwt_secret.txt"
TEMPLATE_FILE="/app/data/templates.json"
DEFAULT_TEMPLATE="/app/default_templates.json"

# Create the directory if it doesn't exist
mkdir -p /app/data

# Check if the secret file already exists
if [ ! -f "$SECRET_FILE" ]; then
    echo "No JWT_SECRET found. Generating a new one..."
    # Uses the native crypto library of Node.js for an extremely secure, 64-character hex string
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > "$SECRET_FILE"
    echo "New JWT_SECRET was saved in $SECRET_FILE."
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "No templates.json found in data volume. Copying defaults..."
    cp "$DEFAULT_TEMPLATE" "$TEMPLATE_FILE"
    echo "Default templates copied."
fi

# Read the secret from the file and make it available for Next.js as a variable
export JWT_SECRET=$(cat "$SECRET_FILE")

# Execute the actual start command of the container (e.g. npm start)
exec "$@"