import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'

const config =  defineConfig({
  name: 'default',
  title: 'agent-management',

  projectId: 'wgxfhb95',
  dataset: 'production',

  basePath: "/admin",

  plugins: [structureTool(), visionTool(), ],

  schema: {
    types: schemaTypes,
  },
})

export default config;
