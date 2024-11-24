require('dotenv').config();
const axios = require('axios');

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

async function testFigmaAccess() {
  try {
    console.log('Testing Figma API access...');
    console.log('File ID:', FIGMA_FILE_ID);
    console.log('Token starts with:', FIGMA_ACCESS_TOKEN.substring(0, 10) + '...');

    // Test file access
    console.log('\nTesting file access...');
    const fileResponse = await axios.get(
      `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN
        }
      }
    );
    
    console.log('✓ File access successful');
    console.log('File name:', fileResponse.data.name);
    console.log('Last modified:', new Date(fileResponse.data.lastModified));
    
    // Test styles access
    console.log('\nTesting styles access...');
    const stylesResponse = await axios.get(
      `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/styles`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN
        }
      }
    );
    
    const styles = stylesResponse.data.meta.styles;
    console.log('✓ Styles access successful');
    console.log('Total styles:', styles.length);
    
    // Show color styles breakdown
    const colorStyles = styles.filter(s => s.style_type === 'FILL');
    console.log('\nColor styles breakdown:');
    console.log('Total color styles:', colorStyles.length);
    if (colorStyles.length > 0) {
      colorStyles.forEach(style => {
        console.log(`- ${style.name}: ${style.description || 'No description'}`);
      });
    }

    // Test variables access
    console.log('\nTesting variables access...');
    const variablesResponse = await axios.get(
      `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/variables/local`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN
        }
      }
    );
    
    console.log('✓ Variables access successful');
    const collections = variablesResponse.data.meta.variableCollections;
    const variables = variablesResponse.data.meta.variables;
    
    console.log('\nVariable collections:', Object.keys(collections).length);
    for (const [id, collection] of Object.entries(collections)) {
      console.log(`\nCollection: ${collection.name}`);
      const collectionVars = Object.values(variables).filter(v => v.variableCollectionId === id);
      console.log('Variables in collection:', collectionVars.length);
      collectionVars.forEach(variable => {
        console.log(`- ${variable.name}: ${variable.resolvedType}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', {
      endpoint: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.err || error.message
    });
    process.exit(1);
  }
}

testFigmaAccess();
