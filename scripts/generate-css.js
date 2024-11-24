const fs = require('fs').promises;
const path = require('path');

async function generateCSS() {
    try {
        console.log('🎨 Generating CSS variables...');
        
        // Read tokens
        const tokensPath = path.join(process.cwd(), 'tokens', 'tokens.json');
        const tokensContent = await fs.readFile(tokensPath, 'utf8');
        const tokens = JSON.parse(tokensContent).global;

        let css = `/**
 * Design System Variables
 * Auto-generated from design tokens
 */

:root {\n`;

        let utilities = `/* Utility Classes */\n\n`;

        // Generate color variables and utilities
        if (tokens.colors) {
            css += `  /* Colors */\n`;
            Object.entries(tokens.colors).forEach(([name, token]) => {
                const varName = `--color-${name}`;
                css += `  ${varName}: ${token.value};\n`;
                
                // Generate color utilities with alpha channel support
                utilities += `.bg-${name} { background-color: var(${varName}); }\n`;
                utilities += `.text-${name} { color: var(${varName}); }\n`;
                utilities += `.border-${name} { border-color: var(${varName}); }\n`;
                utilities += `.hover\\:bg-${name}:hover { background-color: var(${varName}); }\n`;
                utilities += `.hover\\:text-${name}:hover { color: var(${varName}); }\n`;
                utilities += `.hover\\:border-${name}:hover { border-color: var(${varName}); }\n`;
            });
        }

        // Generate shadow variables and utilities
        if (tokens.shadows) {
            css += `\n  /* Shadows */\n`;
            Object.entries(tokens.shadows).forEach(([name, token]) => {
                const shadow = token.value;
                const shadowValue = `${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.spread} ${shadow.color}`;
                const varName = `--shadow-${name}`;
                css += `  ${varName}: ${shadowValue};\n`;
                utilities += `.shadow-${name} { box-shadow: var(${varName}); }\n`;
                utilities += `.hover\\:shadow-${name}:hover { box-shadow: var(${varName}); }\n`;
            });
        }

        // Generate typography variables and utilities
        if (tokens.typography) {
            css += `\n  /* Typography */\n`;

            // Track unique values for utility classes
            const fontSizes = new Set();
            const fontWeights = new Set();
            const lineHeights = new Set();
            const fontFamilies = new Set();
            const letterSpacings = new Set();

            // Generate typography tokens
            Object.entries(tokens.typography).forEach(([name, token]) => {
                const style = token.value;
                
                // Add to unique value sets
                fontSizes.add(style.fontSize);
                fontWeights.add(style.fontWeight);
                lineHeights.add(style.lineHeight);
                fontFamilies.add(style.fontFamily);
                if (style.letterSpacing !== 'normal') {
                    letterSpacings.add(style.letterSpacing);
                }

                // Generate semantic typography variables
                const prefix = `--typography-${name}`;
                css += `\n  /* ${token.description || name} */\n`;
                css += `  ${prefix}-font-family: ${style.fontFamily};\n`;
                css += `  ${prefix}-font-size: ${style.fontSize};\n`;
                css += `  ${prefix}-font-weight: ${style.fontWeight};\n`;
                css += `  ${prefix}-line-height: ${style.lineHeight};\n`;
                css += `  ${prefix}-letter-spacing: ${style.letterSpacing};\n`;

                // Generate combined typography class
                utilities += `.typography-${name} {
  font-family: var(${prefix}-font-family);
  font-size: var(${prefix}-font-size);
  font-weight: var(${prefix}-font-weight);
  line-height: var(${prefix}-line-height);
  letter-spacing: var(${prefix}-letter-spacing);
}\n`;
            });

            // Generate utility classes for individual properties
            utilities += `\n/* Font Size Utilities */\n`;
            fontSizes.forEach(size => {
                const className = size.replace('rem', '').replace('.', '\\.');
                utilities += `.text-${className} { font-size: ${size}; }\n`;
            });

            utilities += `\n/* Font Weight Utilities */\n`;
            fontWeights.forEach(weight => {
                utilities += `.font-${weight} { font-weight: ${weight}; }\n`;
            });

            utilities += `\n/* Line Height Utilities */\n`;
            lineHeights.forEach(height => {
                const className = String(height).replace('.', '\\.');
                utilities += `.leading-${className} { line-height: ${height}; }\n`;
            });

            utilities += `\n/* Font Family Utilities */\n`;
            fontFamilies.forEach(family => {
                const className = family.toLowerCase().replace(/[^a-z0-9]/g, '-');
                utilities += `.font-${className} { font-family: ${family}; }\n`;
            });

            if (letterSpacings.size > 0) {
                utilities += `\n/* Letter Spacing Utilities */\n`;
                letterSpacings.forEach(spacing => {
                    if (spacing !== 'normal') {
                        const className = spacing.replace('em', '').replace('.', '\\.');
                        utilities += `.tracking-${className} { letter-spacing: ${spacing}; }\n`;
                    }
                });
            }
        }

        css += '}\n\n';

        // Add responsive utilities
        utilities += `
/* Responsive Utilities */
@media (min-width: var(--breakpoint-sm)) {
  .sm\\:hidden { display: none; }
  .sm\\:block { display: block; }
  .sm\\:inline-block { display: inline-block; }
  .sm\\:flex { display: flex; }
}

@media (min-width: var(--breakpoint-md)) {
  .md\\:hidden { display: none; }
  .md\\:block { display: block; }
  .md\\:inline-block { display: inline-block; }
  .md\\:flex { display: flex; }
}

@media (min-width: var(--breakpoint-lg)) {
  .lg\\:hidden { display: none; }
  .lg\\:block { display: block; }
  .lg\\:inline-block { display: inline-block; }
  .lg\\:flex { display: flex; }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #ffffff;
    --color-text-muted: #a1a1a1;
    --color-background: #1d1d1f;
    --color-surface: #2d2d2f;
    --color-border: #3d3d3f;
    --color-hover: #3d3d3f;
    --color-selected: #4d4d4f;
  }
}\n`;

        css += utilities;

        // Write the CSS file
        const cssPath = path.join(process.cwd(), 'css', 'variables.css');
        await fs.writeFile(cssPath, css);

        // Write the minified version
        const minifiedCss = css.replace(/\/\*[\s\S]*?\*\/|[\r\n]|\s{2,}/g, '');
        const minCssPath = path.join(process.cwd(), 'css', 'variables.min.css');
        await fs.writeFile(minCssPath, minifiedCss);

        console.log('✅ CSS variables generated successfully');
    } catch (error) {
        console.error('Error generating CSS variables:', error);
        process.exit(1);
    }
}

module.exports = generateCSS;

if (require.main === module) {
    generateCSS();
}
