declare module 'expo-router' {
  import { NavigatorScreenParams } from '@react-navigation/native';
  import { ComponentType, ReactNode } from 'react';
  
  export interface StaticScreenProps {
    children: ReactNode;
    options?: any;
  }
  
  export interface LayoutProps {
    children: ReactNode;
    options?: any;
  }
  
  export interface StackProps {
    children: ReactNode;
    screenOptions?: any;
  }
  
  export interface StackScreenProps {
    name: string;
    options?: any;
  }
  
  export interface TabsProps {
    children: ReactNode;
    screenOptions?: any;
  }
  
  export interface TabsScreenProps {
    name: string;
    options?: any;
  }
  
  export interface LinkProps {
    href: string;
    children?: ReactNode;
    asChild?: boolean;
    onPress?: (event: any) => void;
    target?: string;
    dismissTo?: boolean;
    style?: any;
    [key: string]: any;
  }
  
  export const Stack: ComponentType<StackProps> & {
    Screen: ComponentType<StackScreenProps>;
  };
  
  export const Tabs: ComponentType<TabsProps> & {
    Screen: ComponentType<TabsScreenProps>;
  };
  
  export const Slot: ComponentType<StaticScreenProps>;
  export const Layout: ComponentType<LayoutProps>;
  export const Link: ComponentType<LinkProps>;
  export const Redirect: ComponentType<{ href: string }>;
  
  export function useRouter(): any;
  export function useSegments(): string[];
  export function useGlobalSearchParams(): Record<string, string>;
  export function useLocalSearchParams(): Record<string, string>;
  export function useNavigation(): any;
  export function useFocusEffect(effect: () => void): void;
  export function usePathname(): string;
  export const router: any;
  export type Href = string | object;
}

declare module 'expo-router/build/global-state/router-store' {
  export const router: any;
}