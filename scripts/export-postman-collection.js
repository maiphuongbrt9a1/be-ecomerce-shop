const fs = require('fs');
const path = require('path');
const http = require('http');

/**
 * Script to export OpenAPI spec from running NestJS server
 * and convert it to Postman Collection v2.1 format
 */

const SWAGGER_URL = 'http://localhost:4000/documentation-json';
const OUTPUT_DIR = path.join(__dirname, '..', 'postman');
const OPENAPI_FILE = path.join(OUTPUT_DIR, 'openapi.json');
const POSTMAN_FILE = path.join(OUTPUT_DIR, 'postman-collection.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('📥 Fetching OpenAPI spec from:', SWAGGER_URL);
console.log('⚠️  Make sure your NestJS server is running on port 4000!\n');

// Fetch OpenAPI spec
http.get(SWAGGER_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const openApiSpec = JSON.parse(data);
      
      // Save OpenAPI spec
      fs.writeFileSync(OPENAPI_FILE, JSON.stringify(openApiSpec, null, 2));
      console.log('✅ OpenAPI spec saved to:', OPENAPI_FILE);

      // Convert to Postman Collection
      const postmanCollection = convertToPostman(openApiSpec);
      fs.writeFileSync(POSTMAN_FILE, JSON.stringify(postmanCollection, null, 2));
      console.log('✅ Postman collection saved to:', POSTMAN_FILE);

      console.log('\n🎉 Export complete!');
      console.log('\n📝 Next steps:');
      console.log('   1. Open Postman');
      console.log('   2. Click "Import"');
      console.log('   3. Select file:', POSTMAN_FILE);
      console.log('   4. Start testing your APIs!\n');
    } catch (err) {
      console.error('❌ Error parsing response:', err.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('❌ Error fetching OpenAPI spec:', err.message);
  console.error('\n💡 Tips:');
  console.error('   - Make sure your NestJS server is running: npm run start:dev');
  console.error('   - Check if port 4000 is accessible');
  console.error('   - Verify Swagger is enabled at http://localhost:4000/documentation\n');
  process.exit(1);
});

/**
 * Convert OpenAPI 3.0 spec to Postman Collection v2.1
 */
function convertToPostman(openApiSpec) {
  const collection = {
    info: {
      name: openApiSpec.info.title || 'API Collection',
      description: openApiSpec.info.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      version: openApiSpec.info.version || '1.0.0',
    },
    item: [],
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{access_token}}',
          type: 'string',
        },
      ],
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:4000',
        type: 'string',
      },
      {
        key: 'access_token',
        value: '',
        type: 'string',
      },
    ],
  };

  const servers = openApiSpec.servers || [{ url: 'http://localhost:4000' }];
  const baseUrl = servers[0]?.url || 'http://localhost:4000';

  // Group endpoints by tags
  const groupedEndpoints = {};

  for (const [path, pathItem] of Object.entries(openApiSpec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
        continue;
      }

      const tag = operation.tags?.[0] || 'Other';
      if (!groupedEndpoints[tag]) {
        groupedEndpoints[tag] = [];
      }

      const request = {
        name: operation.summary || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [],
          url: {
            raw: `{{baseUrl}}${path}`,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(Boolean),
          },
          description: operation.description || '',
        },
      };

      // Add query parameters
      if (operation.parameters) {
        const queryParams = operation.parameters
          .filter((p) => p.in === 'query')
          .map((p) => ({
            key: p.name,
            value: p.example || p.schema?.example || '',
            description: p.description || '',
            disabled: !p.required,
          }));

        if (queryParams.length > 0) {
          request.request.url.query = queryParams;
        }

        // Add path variables
        const pathVars = operation.parameters
          .filter((p) => p.in === 'path')
          .map((p) => ({
            key: p.name,
            value: p.example || p.schema?.example || '',
            description: p.description || '',
          }));

        if (pathVars.length > 0) {
          request.request.url.variable = pathVars;
        }

        // Add headers
        const headerParams = operation.parameters
          .filter((p) => p.in === 'header')
          .map((p) => ({
            key: p.name,
            value: p.example || p.schema?.example || '',
            description: p.description || '',
          }));

        request.request.header.push(...headerParams);
      }

      // Add request body
      if (operation.requestBody?.content) {
        const contentType = Object.keys(operation.requestBody.content)[0];
        const schema = operation.requestBody.content[contentType]?.schema;

        request.request.header.push({
          key: 'Content-Type',
          value: contentType,
        });

        if (schema) {
          const bodyExample = generateExample(schema, openApiSpec.components?.schemas);
          request.request.body = {
            mode: 'raw',
            raw: JSON.stringify(bodyExample, null, 2),
            options: {
              raw: {
                language: 'json',
              },
            },
          };
        }
      }

      // Add auth header for protected routes
      if (!operation.tags?.includes('auth') && operation.summary !== 'Login account') {
        request.request.auth = {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{access_token}}',
              type: 'string',
            },
          ],
        };
      }

      groupedEndpoints[tag].push(request);
    }
  }

  // Convert grouped endpoints to Postman folders
  for (const [tag, requests] of Object.entries(groupedEndpoints)) {
    collection.item.push({
      name: tag,
      item: requests,
    });
  }

  return collection;
}

/**
 * Generate example data from OpenAPI schema
 */
function generateExample(schema, components) {
  if (!schema) return {};

  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref.split('/').pop();
    const refSchema = components?.[refPath];
    if (refSchema) {
      return generateExample(refSchema, components);
    }
  }

  // Handle example or default
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  // Handle different types
  switch (schema.type) {
    case 'object':
      const obj = {};
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          obj[key] = generateExample(prop, components);
        }
      }
      return obj;

    case 'array':
      return schema.items ? [generateExample(schema.items, components)] : [];

    case 'string':
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'date') return new Date().toISOString().split('T')[0];
      if (schema.enum) return schema.enum[0];
      return 'string';

    case 'number':
    case 'integer':
      return 0;

    case 'boolean':
      return false;

    default:
      return null;
  }
}
