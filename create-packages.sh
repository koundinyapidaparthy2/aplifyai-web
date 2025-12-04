#!/bin/bash
# Script to create all centralized packages

PACKAGES_DIR="/Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/packages"

# Function to create package.json
create_package_json() {
  local pkg_name=$1
  local has_react=$2
  
  cat > "$PACKAGES_DIR/$pkg_name/package.json" << EOF
{
  "name": "@aplifyai/$pkg_name",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  $(if [ "$has_react" = "true" ]; then echo '"peerDependencies": {"react": "^19.0.0"},'; fi)
  "devDependencies": {
    $(if [ "$has_react" = "true" ]; then echo '"@types/react": "^19",'; fi)
    "tsup": "^8.0.0",
    "typescript": "^5"
  }
}
EOF
}

# Function to create tsconfig.json
create_tsconfig() {
  local pkg_name=$1
  cat > "$PACKAGES_DIR/$pkg_name/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
}

# Function to create tsup.config.ts
create_tsup_config() {
  local pkg_name=$1
  local external=$2
  
  cat > "$PACKAGES_DIR/$pkg_name/tsup.config.ts" << EOF
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  $(if [ -n "$external" ]; then echo "external: [$external],"; fi)
});
EOF
}

# Create all packages
for pkg in utils hooks constants api validation storage analytics errors logger test-utils flags; do
  echo "Creating $pkg..."
  
  if [ "$pkg" = "hooks" ] || [ "$pkg" = "test-utils" ]; then
    create_package_json "$pkg" "true"
  else
    create_package_json "$pkg" "false"
  fi
  
  create_tsconfig "$pkg"
  
  if [ "$pkg" = "hooks" ]; then
    create_tsup_config "$pkg" "'react'"
  else
    create_tsup_config "$pkg" ""
  fi
done

echo "All packages created!"
