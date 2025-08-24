import { Property, Group, Activity } from '@/types/app';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento em Pinheiros',
    location: 'Pinheiros, São Paulo, SP',
    price: 450000,
    m2: 65,
    condo: 450,
    iptu: 1200,
    rooms: 2,
    parking: 1,
    score: 78,
    scoreReasons: {
      pros: ['Área acima da média para o bairro', 'Preço competitivo', 'Localização privilegiada'],
      cons: ['Condomínio alto', 'IPTU elevado', 'Poucas vagas']
    },
    description: 'Excelente apartamento em Pinheiros, próximo ao metrô e com todas as comodidades do bairro.',
    amenities: ['Academia', 'Piscina', 'Salão de festas', 'Portaria 24h'],
    photos: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
    sourceUrl: 'https://example.com/property',
    addedBy: 'João Silva',
    addedAt: '2 horas atrás',
  },
  {
    id: '2',
    title: 'Casa em Vila Madalena',
    location: 'Vila Madalena, São Paulo, SP',
    price: 850000,
    m2: 120,
    condo: 0,
    iptu: 1800,
    rooms: 3,
    parking: 2,
    score: 85,
    scoreReasons: {
      pros: ['Área generosa', 'Sem condomínio', 'Localização cultural'],
      cons: ['Preço elevado', 'IPTU alto', 'Manutenção própria']
    },
    description: 'Linda casa em Vila Madalena, com jardim e garagem para 2 carros.',
    amenities: ['Jardim', 'Garagem', 'Área de lazer'],
    photos: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
    sourceUrl: 'https://example.com/property',
    addedBy: 'Maria Silva',
    addedAt: '1 dia atrás',
  },
  {
    id: '3',
    title: 'Apartamento em Itaim Bibi',
    location: 'Itaim Bibi, São Paulo, SP',
    price: 1200000,
    m2: 85,
    condo: 800,
    iptu: 2500,
    rooms: 2,
    parking: 1,
    score: 72,
    scoreReasons: {
      pros: ['Localização nobre', 'Acabamento de luxo', 'Segurança'],
      cons: ['Preço muito alto', 'Condomínio elevado', 'IPTU alto']
    },
    description: 'Apartamento de luxo em Itaim Bibi, com acabamento premium e localização privilegiada.',
    amenities: ['Academia', 'Piscina', 'Spa', 'Portaria 24h', 'Segurança'],
    photos: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
    sourceUrl: 'https://example.com/property',
    addedBy: 'Pedro Costa',
    addedAt: '3 horas atrás',
  },
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Família Silva',
    description: 'Grupo da família para busca de imóveis',
    members: [
      { id: '1', name: 'João Silva', role: 'owner', avatar: 'JS' },
      { id: '2', name: 'Maria Silva', role: 'member', avatar: 'MS' },
      { id: '3', name: 'Pedro Silva', role: 'member', avatar: 'PS' },
      { id: '4', name: 'Ana Silva', role: 'member', avatar: 'AS' },
    ],
    properties: mockProperties.slice(0, 2),
    inviteCode: 'familiasilva123',
  },
  {
    id: '2',
    name: 'Amigos Trabalho',
    description: 'Colegas buscando imóveis na região',
    members: [
      { id: '5', name: 'Carlos Santos', role: 'owner', avatar: 'CS' },
      { id: '6', name: 'Ana Costa', role: 'member', avatar: 'AC' },
      { id: '7', name: 'Roberto Lima', role: 'member', avatar: 'RL' },
      { id: '8', name: 'Fernanda Rocha', role: 'member', avatar: 'FR' },
      { id: '9', name: 'Lucas Oliveira', role: 'member', avatar: 'LO' },
      { id: '10', name: 'Patrícia Alves', role: 'member', avatar: 'PA' },
    ],
    properties: [mockProperties[2]],
    inviteCode: 'amigostrabalho456',
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'property_added',
    user: 'João Silva',
    message: 'adicionou um novo imóvel',
    property: 'Apartamento em Pinheiros',
    timestamp: '2 horas atrás',
    reactions: { like: 2, love: 1 },
  },
  {
    id: '2',
    type: 'comment',
    user: 'Maria Silva',
    message: 'Gostei muito deste! Preço está ótimo para a região',
    property: 'Apartamento em Pinheiros',
    timestamp: '1 hora atrás',
    reactions: { like: 3 },
  },
  {
    id: '3',
    type: 'property_added',
    user: 'Pedro Costa',
    message: 'Encontrei esta opção também',
    property: 'Casa em Vila Madalena',
    timestamp: '3 horas atrás',
    reactions: { like: 1, wow: 1 },
  },
];

export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '+55 11 99999-9999',
  role: 'user' as const,
  verified: true,
};

export const mockNotificationSettings = {
  weeklyDigest: true,
  newSimilar: true,
  groupActivity: true,
  priceChanges: false,
  marketUpdates: true,
};

export const mockPropertyPreferences = {
  maxPrice: 800000,
  minArea: 60,
  maxArea: 150,
  neighborhoods: ['Pinheiros', 'Vila Madalena', 'Itaim Bibi'],
  propertyTypes: ['apartment', 'house'],
  minParking: 1,
};

export const mockWhatsAppStatus = {
  connected: true,
  phone: '+55 11 99999-9999',
  lastSync: '2 horas atrás',
};
