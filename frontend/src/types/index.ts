export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
  emergencyContact?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  lastLogin?: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  _count?: {
    reports: number;
  };
}

export interface Report {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  userId: string;
  status: 'PENDING' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  videoUrl?: string;
  upvotes: number;
  downvotes: number;
  isVerified: boolean;
  isEmergency: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  reportId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'SOS' | 'FIRE' | 'MEDICAL' | 'CRIME' | 'NATURAL_DISASTER' | 'OTHER';
  status: 'ACTIVE' | 'RESPONDING' | 'RESOLVED' | 'CANCELLED';
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  isSuspicious?: boolean;
  message?: string;
  isSilent: boolean;
  resolvedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    phone?: string;
    avatar?: string;
  };
}

export interface AIPrediction {
  id: string;
  userId?: string;
  type: string;
  title: string;
  description: string;
  dangerScore: number;
  latitude: number;
  longitude: number;
  radius: number;
  predictions?: any;
  recommendations?: string[];
  validUntil: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'DANGER' | 'EMERGENCY' | 'AI_ALERT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}
