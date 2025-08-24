export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  m2: number;
  condo: number;
  iptu: number;
  rooms: number;
  parking: number;
  score: number;
  scoreReasons: {
    pros: string[];
    cons: string[];
  };
  description: string;
  amenities: string[];
  photos: string[];
  sourceUrl: string;
  similarProperties?: Property[];
  addedBy?: string;
  addedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  properties: Property[];
  inviteCode: string;
}

export interface GroupMember {
  id: string;
  name: string;
  role: 'owner' | 'member';
  avatar: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  reactions: Record<string, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  role: 'user' | 'broker' | 'admin';
  verified: boolean;
  preferences?: PropertyPreferences;
}

export interface NotificationSettings {
  weeklyDigest: boolean;
  newSimilar: boolean;
  groupActivity: boolean;
  priceChanges: boolean;
  marketUpdates: boolean;
  [key: string]: boolean; // Para permitir acesso dinâmico
}

export interface PropertyPreferences {
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  neighborhoods: string[];
  propertyTypes: string[];
  minParking: number;
}

export interface WhatsAppStatus {
  connected: boolean;
  phone: string;
  lastSync: string;
}

export interface Activity {
  id: string;
  type: 'property_added' | 'comment' | 'reaction';
  user: string;
  message: string;
  property?: string;
  timestamp: string;
  reactions: Record<string, number>;
}
