export const routes = {
  // Rotas públicas
  public: {
    home: '/',
    compare: '/compare',
    broker: '/c/:slug',
    property: '/p/:propertyId',
  },
  
  // Rotas do cliente autenticado
  app: {
    home: '/app',
    properties: '/app/properties',
    propertyDetail: '/app/properties/:id',
    compare: '/app/compare',
    groups: '/app/groups',
    groupDetail: '/app/groups/:groupId',
    profile: '/app/profile',
  },
  
  // Rotas do corretor
  broker: {
    dashboard: '/corretor',
    properties: '/corretor/properties',
    newProperty: '/corretor/properties/new',
    groups: '/corretor/groups',
    page: '/corretor/page',
    contacts: '/corretor/contacts',
  },
  
  // Rotas de autenticação
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    callback: '/auth/callback',
    verifyEmail: '/auth/verify-email',
  },
  
  // Rotas da API
  api: {
    webhooks: {
      evolution: '/api/webhooks/evolution',
    },
    properties: '/api/properties',
    compare: {
      public: '/api/compare/public',
    },
    groups: '/api/groups',
    broker: {
      page: '/api/broker/page',
      highlights: '/api/broker/highlights',
    },
  },
} as const;

export type RouteKey = keyof typeof routes;
export type AppRoute = typeof routes.app[keyof typeof routes.app];
export type PublicRoute = typeof routes.public[keyof typeof routes.public];
export type BrokerRoute = typeof routes.broker[keyof typeof routes.broker];
export type AuthRoute = typeof routes.auth[keyof typeof routes.auth];
