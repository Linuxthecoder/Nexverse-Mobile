import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

interface LucideIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const LucideIcon: React.FC<LucideIconProps> = ({ name, size = 24, color = '#000', style }) => {
  // Convert kebab-case to PascalCase for Lucide icon names
  const pascalCaseName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Check if the icon exists in the LucideIcons object
  const IconComponent = (LucideIcons as any)[pascalCaseName];

  if (!IconComponent) {
    console.warn(`Icon '${name}' (${pascalCaseName}) not found in LucideIcons`);
    return null;
  }

  return <IconComponent size={size} color={color} style={style} />;
};

export default LucideIcon;