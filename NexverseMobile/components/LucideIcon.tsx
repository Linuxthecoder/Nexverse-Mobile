import React from 'react';
import { ViewStyle } from 'react-native';
import {
  Camera,
  User,
  ShieldCheck,
  Bell,
  Moon,
  Globe,
  Cloud,
  HelpCircle,
  MessageCircle,
  Star,
  ChevronRight,
  LogOut,
  Video,
  Mic,
  FileText,
  X,
  Search,
  MoreVertical,
  ArrowLeft,
  Plus,
  Send,
  ShieldAlert,
  PartyPopper,
  LogIn,
  CheckCheck,
  Check,
  BellOff,
  Trash2,
  Home,
  Compass,
  Settings,
  Sparkles,
  MessageSquare,
  Zap,
  Shield,
  SearchX,
  Users,
  Calendar,
  Bookmark,
  UserPlus,
  QrCode,
  Image as ImageIcon, // Alias to avoid conflict if needed, though Lucide exports it as Image
  Phone,
  Paperclip,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Mail,
  Download,
  Upload,
  Clock,
  MapPin,
  Wifi,
  Bluetooth,
  Battery,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Info,
  Edit,
  Menu,
  AlertCircle
} from 'lucide-react-native';

// Map of kebab-case or alias names to the actual components
const iconMap: Record<string, any> = {
  'camera': Camera,
  'user': User,
  'users': Users,
  'user-plus': UserPlus,
  'shield-check': ShieldCheck,
  'shield-checkmark-outline': ShieldCheck, // alias for settings.tsx legacy
  'bell': Bell,
  'notifications': Bell, // alias
  'moon': Moon,
  'globe': Globe,
  'cloud': Cloud,
  'help-circle': HelpCircle,
  'message-circle': MessageCircle,
  'chatbubble-outline': MessageCircle, // alias
  'star': Star,
  'chevron-right': ChevronRight,
  'chevron-forward': ChevronRight, // alias
  'log-out': LogOut,
  'video': Video,
  'mic': Mic,
  'file-text': FileText,
  'x': X,
  'close': X, // alias
  'search': Search,
  'more-vertical': MoreVertical,
  'arrow-left': ArrowLeft,
  'plus': Plus,
  'add': Plus, // alias
  'send': Send,
  'shield-alert': ShieldAlert,
  'party-popper': PartyPopper,
  'log-in': LogIn,
  'check-check': CheckCheck,
  'check': Check,
  'bell-off': BellOff,
  'trash-2': Trash2,
  'trash': Trash2, // alias
  'home': Home,
  'compass': Compass,
  'explore': Compass, // alias
  'settings': Settings,
  'sparkles': Sparkles,
  'message-square': MessageSquare,
  'chat': MessageSquare, // alias
  'chats': MessageCircle, // or MessagesSquare, mapping to MessageCircle for consistency
  'zap': Zap,
  'shield': Shield,
  'search-x': SearchX,
  'calendar': Calendar,
  'bookmark': Bookmark,
  'qr-code': QrCode,
  'image': ImageIcon,
  'phone': Phone,
  'paperclip': Paperclip,
  'share': Share2,
  'lock': Lock,
  'unlock': Unlock,
  'eye': Eye,
  'eye-off': EyeOff,
  'mail': Mail,
  'download': Download,
  'upload': Upload,
  'clock': Clock,
  'map-pin': MapPin,
  'wifi': Wifi,
  'bluetooth': Bluetooth,
  'battery': Battery,
  'play': Play,
  'pause': Pause,
  'stop': Stop,
  'refresh': RefreshCw,
  'info': Info,
  'edit': Edit,
  'create': Edit, // alias
  'menu': Menu,
  'alert-circle': AlertCircle
};

interface LucideIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
  strokeWidth?: number;
}

const LucideIcon: React.FC<LucideIconProps> = ({ name, size = 24, color = '#000', style, strokeWidth = 2 }) => {
  // 1. Check direct map
  let IconComponent = iconMap[name];

  // 2. Fallback: try to finding PascalCase version if not in map? 
  // We can't do dynamic "Icons[Pascal]" because we removed the `import *`.
  // So we rely on the extensive map above.

  if (!IconComponent) {
    // Try resolving aliases or common mismatches manually if needed
    if (name.includes('outline')) {
      const coreName = name.replace('-outline', '');
      IconComponent = iconMap[coreName];
    }
  }

  if (!IconComponent) {
    if (__DEV__) {
      console.warn(`Icon '${name}' not found in LucideIcon map. Please add it to components/LucideIcon.tsx`);
    }
    // Render a fallback icon or nothing
    return <HelpCircle size={size} color={color} style={style} strokeWidth={strokeWidth} />;
  }

  return <IconComponent size={size} color={color} style={style} strokeWidth={strokeWidth} />;
};

export default LucideIcon;