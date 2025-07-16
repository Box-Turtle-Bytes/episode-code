# AGENTS.md

## Build, Lint, and Test Commands
- Build: `npm run build`
- Watch: `npm run watch`
- Test: `npm run test` (Jest)
- Run a single test: `npm run test -- -t 'test name'`
- Deploy CDK: `npx cdk deploy`
- Diff CDK: `npx cdk diff`
- Synth CDK: `npx cdk synth`

## Code Style Guidelines
- Use TypeScript strict mode (`strict`, `noImplicitAny`, `noImplicitReturns`, etc.)
- Prefer explicit function return types
- Max line length: 160
- Use semi-colons, single quotes, trailing commas
- Tab width: 4
- Use ES2020, CommonJS modules
- Imports: Use `.ts` extension for TypeScript files, never for packages
- Follow airbnb-typescript/base conventions (camelCase for variables/functions, PascalCase for classes/types)
- Error handling: Use explicit types, strict null checks
- No restrictions on nested ternaries, restricted syntax, or use-before-define
- Lint with ESLint and format with Prettier

No Cursor or Copilot rules are present in this repository.
