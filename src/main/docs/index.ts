import paths from './paths'
import components from './components'
import schemas from './schemas'

export default {
  openapi: '3.0.0',
  info: {
    title: 'Clean Node API - Enquetes para Programadores',
    description:
      'API de enquetes para programadores construída com TypeScript, TDD, Clean Architecture e princípios SOLID.',
    version: '1.0.0',
    license: {
      name: 'ISC'
    }
  },
  servers: [{ url: '/api', description: 'Servidor Principal' }],
  tags: [
    { name: 'Login', description: 'APIs relacionadas a Login' },
    { name: 'Enquete', description: 'APIs relacionadas a Enquete' }
  ],
  paths,
  schemas,
  components
}
