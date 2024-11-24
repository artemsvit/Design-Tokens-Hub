const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const generateCSS = require('./generate-css');
require('dotenv').config();

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

const figmaApi = axios.create({
    baseURL: 'https://api.figma.com/v1',
    headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
});

async function getFigmaDocument() {
    console.log('🔍 Fetching Figma document...');
    
    try {
        // Get all local styles
        console.log('🔍 Fetching local styles...');
        const stylesResponse = await figmaApi.get(`/files/${FIGMA_FILE_ID}/styles`);
        console.log('Raw Figma styles response:', JSON.stringify(stylesResponse.data, null, 2));

        const styles = stylesResponse.data.meta.styles;
        console.log('✓ Found local styles:', styles.length);

        // Get node details for each style
        const nodeIds = styles.map(style => style.node_id).join(',');
        console.log('Fetching nodes:', nodeIds);
        
        const nodesResponse = await figmaApi.get(`/files/${FIGMA_FILE_ID}/nodes?ids=${nodeIds}`);
        console.log('Nodes response:', JSON.stringify(nodesResponse.data, null, 2));

        // Map styles with their node data
        const localStyles = styles.map(style => ({
            ...style,
            node: nodesResponse.data.nodes[style.node_id]?.document
        }));

        return localStyles;
    } catch (error) {
        console.error('Error fetching Figma data:', error.response?.data || error.message);
        throw error;
    }
}

function formatTokenName(name) {
    // Split the name into parts and remove any "/"
    const parts = name.split('/').join(' ').trim().split(' ');
    
    // Convert to camelCase
    return parts.map((part, index) => {
        // Clean the part of any special characters
        part = part.replace(/[^a-zA-Z0-9]/g, '');
        // If it's the first word, make it lowercase
        if (index === 0) {
            return part.toLowerCase();
        }
        // For other words, capitalize the first letter
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join('');
}

function extractTokens(styles) {
    console.log('🔄 Extracting tokens from styles...');
    console.log('Found', styles.length, 'total styles');

    const colorStyles = styles.filter(s => s.style_type === 'FILL');
    const effectStyles = styles.filter(s => s.style_type === 'EFFECT');
    const textStyles = styles.filter(s => s.style_type === 'TEXT');

    console.log(`Processing ${colorStyles.length} color styles...`);
    console.log(`Processing ${effectStyles.length} effect styles...`);
    console.log(`Processing ${textStyles.length} text styles...`);

    const tokens = {
        global: {
            colors: {},
            shadows: {},
            typography: {}
        }
    };

    // Process colors
    colorStyles.forEach(style => {
        const fill = style.node?.fills?.[0];
        if (fill && fill.type === 'SOLID') {
            const { r, g, b } = fill.color;
            const hex = rgbaToHex(r * 255, g * 255, b * 255);
            const tokenName = formatTokenName(style.name);
            tokens.global.colors[tokenName] = {
                value: hex,
                type: 'color',
                description: style.description || style.name
            };
            console.log(`Processed color token: ${style.name} -> ${tokenName}`);
        }
    });

    // Process shadows
    effectStyles.forEach(style => {
        if (style.node?.effects) {
            const shadowEffects = style.node.effects.filter(e => e.type === 'DROP_SHADOW');
            if (shadowEffects.length > 0) {
                const tokenName = formatTokenName(style.name);
                tokens.global.shadows[tokenName] = {
                    value: {
                        x: `${shadowEffects[0].offset.x}px`,
                        y: `${shadowEffects[0].offset.y}px`,
                        blur: `${shadowEffects[0].radius}px`,
                        spread: `${shadowEffects[0].spread || 0}px`,
                        color: rgbaToHex(
                            shadowEffects[0].color.r * 255,
                            shadowEffects[0].color.g * 255,
                            shadowEffects[0].color.b * 255,
                            shadowEffects[0].color.a
                        )
                    },
                    type: 'boxShadow',
                    description: style.description || style.name
                };
                console.log(`Processed shadow token: ${style.name} -> ${tokenName}`);
            }
        }
    });

    // Process typography
    textStyles.forEach(style => {
        if (style.node?.style) {
            const { style: textStyle } = style.node;
            const tokenName = formatTokenName(style.name);
            tokens.global.typography[tokenName] = {
                value: {
                    fontFamily: formatFontFamily(textStyle.fontFamily),
                    fontSize: pxToRem(textStyle.fontSize),
                    fontWeight: textStyle.fontWeight,
                    lineHeight: calculateUnitlessLineHeight(textStyle.lineHeightPx, textStyle.fontSize),
                    letterSpacing: textStyle.letterSpacing === 0 ? 'normal' : `${textStyle.letterSpacing}px`
                },
                type: 'typography',
                description: style.description || style.name
            };
            console.log(`Processed typography token: ${style.name} -> ${tokenName}`);
        }
    });

    return tokens;
}

function rgbaToHex(r, g, b, a = 1) {
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return a === 1 
        ? `#${toHex(r)}${toHex(g)}${toHex(b)}`
        : `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
}

function pxToRem(px) {
    const baseFontSize = 16;
    return `${px / baseFontSize}rem`;
}

function calculateUnitlessLineHeight(lineHeightPx, fontSize) {
    return lineHeightPx ? +(lineHeightPx / fontSize).toFixed(3) : 1;
}

function formatFontFamily(fontFamily) {
    return fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
}

async function fetchUpdates() {
    console.log('🎨 Starting Figma token sync...');
    
    try {
        // Load existing tokens
        console.log('📂 Loading existing tokens...');
        const tokensPath = path.join(process.cwd(), 'tokens', 'tokens.json');
        let existingTokens = {};
        try {
            const tokensFile = await fs.readFile(tokensPath, 'utf8');
            existingTokens = JSON.parse(tokensFile);
        } catch (error) {
            console.log('No existing tokens found or invalid JSON');
        }

        // Fetch new data from Figma
        console.log('📥 Fetching Figma data...');
        const figmaStyles = await getFigmaDocument();
        
        // Extract tokens from Figma styles
        const newTokens = extractTokens(figmaStyles);
        console.log('✅ Token extraction complete');
        console.log('📊 Extracted tokens:', JSON.stringify(newTokens, null, 2));

        // Compare tokens
        console.log('🔍 Comparing tokens...');
        
        // Write new tokens
        console.log('💾 Writing tokens...');
        await fs.writeFile(tokensPath, JSON.stringify(newTokens, null, 2));

        // Generate CSS
        await generateCSS();

        return {
            success: true,
            message: '✅ Token sync complete'
        };
    } catch (error) {
        console.error('❌ Error syncing tokens:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = fetchUpdates;

if (require.main === module) {
    fetchUpdates();
}
