import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    bg?: string;
}

export default function ScreenWrapper({ children, style, bg }: ScreenWrapperProps) {
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 5 : 30;

    return (
        <View style={[{ flex: 1, paddingTop, backgroundColor: bg || '#fff' }, style]}>
            {children}
        </View>
    );
}
