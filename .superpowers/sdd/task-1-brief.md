# Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/cli.ts` (minimal)
- Create: `src/index.ts` (minimal)

**Interfaces:**
- Consumes: none
- Produces: project structure ready for development

- [ ] **Step 1: Initialize Bun project**

```bash
cd D:\repos\chrome-ext-manager
bun init -y
```

- [ ] **Step 2: Install dependencies**

```bash
bun add commander node-forge
bun add -d @types/node @types/bun typescript
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 4: Create minimal src/cli.ts**

```typescript
#!/usr/bin/env bun

console.log("ext-cli - Chrome/Edge Extension Manager");
```

- [ ] **Step 5: Create minimal src/index.ts**

```typescript
export { downloadExtension } from "./downloader";
export { extractCrx } from "./extractor";
export { packCrx } from "./packer";
```

- [ ] **Step 6: Add scripts to package.json**

Add to `package.json`:
```json
{
  "name": "ext-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "ext-cli": "./src/cli.ts"
  },
  "scripts": {
    "build": "bun build src/cli.ts --compile --outfile ext-cli",
    "dev": "bun run src/cli.ts",
    "test": "bun test"
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold ext-cli project with bun, typescript, commander"
```
