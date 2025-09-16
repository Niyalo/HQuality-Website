# HQuality Real Estate Management System - AI Coding Guide

## Project Architecture

This is a Next.js 15 + Sanity CMS real estate management system deployed on Netlify. The core data model centers around three entities: `user` (agents), `client`, and `property` with complex relationships managed through Sanity references.

### Key Architecture Patterns

**Sanity Integration**: All data operations use `sanity/sanity-utils.ts` client. API routes use separate clients with write tokens for mutations. Schema definitions in `sanity/schemaTypes/` define the content model.

**Reference Expansion**: Always use GROQ queries with `->` expansion for references:
```typescript
// Correct: Expands agent and clients references
const query = `*[_type == "property"]{
  ...,
  agent->{ _id, firstname, lastname },
  clients[]->{ _id, first_name, last_name }
}`;
```

**Type Safety**: Centralized types in `types/index.ts` define expanded reference shapes. Use `AgentInfo`, `ClientInfo`, and `Property` interfaces consistently across components.

## Development Workflows

**Local Development**: Run `npm run dev --turbopack` for fast development with Turbopack
**Sanity Studio**: Access at `/admin` path (configured in `sanity.config.ts`)
**Build & Deploy**: Netlify automatically builds via `netlify.toml` configuration

## Critical Patterns

### 1. Modal State Management
The `AddPropertyModal` component demonstrates the edit/add pattern:
- Single modal handles both create and edit modes via `propertyToEdit` prop
- Form state resets on modal open/close using `useEffect` dependencies
- Reference dropdowns populated via separate Sanity queries

### 2. API Route Structure
Follow the established pattern in `src/app/api/`:
- Use `next-sanity` client with write token for mutations
- Generate UUIDs for array items (images, client references)
- Return proper HTTP status codes and error handling

### 3. Image Handling
Images use Sanity's asset system:
- Upload via `client.assets.upload('image', file)`
- Store as references: `{ _type: 'image', asset: { _ref: assetId } }`
- Configure Next.js domains: `cdn.sanity.io` and `images.unsplash.com`

### 4. Component Organization
- Page components are thin wrappers (e.g., `properties/page.tsx`)
- Business logic in separate component files (e.g., `properties.tsx`)
- Modal forms in `addForms/` directory with consistent naming

## Environment Variables Required

```
NEXT_PUBLIC_SANITY_PROJECT_ID=wgxfhb95
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=[for API routes]
```

## Deployment Notes

- Netlify configuration in `netlify.toml` with Next.js plugin
- Build command: `npm run build`
- Functions directory: `out/functions`
- Webpack configuration excludes Netlify plugin from client bundle

## Common Gotchas

1. **Reference vs Expanded Data**: Properties have `agent?._id` when expanded, not `agent?._ref`
2. **Array Mutations**: Always include `_key` with UUID for Sanity array items
3. **Image Previews**: Clean up `URL.createObjectURL()` in `useEffect` cleanup
4. **Type Consistency**: Import types from `types/index.ts`, don't duplicate locally

## Key Files to Understand

- `sanity/schemaTypes/property.ts` - Core data model with validation rules
- `src/app/addForms/AddPropertyModel.tsx` - Complex form handling pattern
- `src/app/api/add-property/route.ts` - Sanity mutation API pattern
- `types/index.ts` - Type definitions for expanded Sanity references