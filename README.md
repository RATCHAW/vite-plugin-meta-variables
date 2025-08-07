# vite-plugin-meta-variables

Load JSON files through `import.meta` with TypeScript support. **Edit JSON files at runtime without rebuilding your app.**

## Setup

Install:
```bash
npm install vite-plugin-meta-variables
```

Configure in `vite.config.ts`:
```typescript
import { metaVariables } from 'vite-plugin-meta-variables';

export default defineConfig({
  plugins: [
    metaVariables({
      JsonFiles: [
        { name: 'config', path: './config.json' }
      ],
      typesOutputPath: './src/meta-variables.d.ts'
    })
  ]
});
```

Create `config.json`:
```json
{
  "foo": "bar",
  "enabled": true
}
```

Use in your code:
```typescript
console.log(import.meta.config.foo); // "bar"
console.log(import.meta.config.enabled); // true
```

**Runtime editing**: Edit the JSON file on your server and changes apply immediately - no rebuild needed!