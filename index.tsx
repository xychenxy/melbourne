npx @openapitools/openapi-generator-cli generate \
  -i https://your-api/swagger/v1/swagger.json \
  -g typescript-axios \
  -o src/api/generated \
  --global-property=models,modelDocs=false,modelTests=false \
  --additional-properties=supportsES6=true
