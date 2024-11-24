# Design System with Figma Token Sync

This project automatically synchronizes design tokens from Figma to your codebase, maintaining consistency between design and implementation.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create a \`.env\` file in the root directory:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Add your Figma credentials to the \`.env\` file:
- Get your Figma access token from Figma > Account Settings > Access tokens
- Get your Figma file ID from the URL of your Figma file (e.g., figma.com/file/YOUR_FILE_ID/...)

## Usage

1. Fetch tokens from Figma:
\`\`\`bash
npm run tokens:fetch
\`\`\`

2. Build platform-specific token files:
\`\`\`bash
npm run tokens:build
\`\`\`

This will generate:
- CSS variables in \`build/css/variables.css\`
- SCSS variables in \`build/scss/_variables.scss\`

## Token Structure

The system handles the following token types:
- Colors
- Typography
- Spacing
- Border Radius

## Adding New Token Types

1. Add the new token type in \`scripts/fetchTokens.js\`
2. Update the Style Dictionary config in \`config.json\` if needed
3. Run the fetch and build commands

## Best Practices

1. Name your Figma styles consistently
2. Use appropriate style types in Figma
3. Include necessary metadata in style descriptions
4. Commit generated token files to version control
