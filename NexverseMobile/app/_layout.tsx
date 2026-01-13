import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { useColorScheme, View, ActivityIndicator, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
// import * as Notifications from 'expo-notifications';

import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';

// Custom theme that uses our color constants
const CustomLightTheme: typeof DefaultTheme = {
  dark: false,
  colors: {
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.unreadBadge,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

const CustomDarkTheme: typeof DarkTheme = {
  dark: true,
  colors: {
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.unreadBadge,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

export default function RootLayout() {
  const { theme, loadTheme } = useThemeStore();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  // const notificationListener = useRef<Notifications.EventSubscription>();
  // const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    loadTheme();
    checkAuth();

    // Register for push notifications
    // const registerForPushNotificationsAsync = async () => {
    //   if (Platform.OS === 'android') {
    //     await Notifications.setNotificationChannelAsync('default', {
    //       name: 'default',
    //       importance: Notifications.AndroidImportance.MAX,
    //       vibrationPattern: [0, 250, 250, 250],
    //       lightColor: '#FF231F7C',
    //     });
    //   }

    //   const { status: existingStatus } = await Notifications.getPermissionsAsync();
    //   let finalStatus = existingStatus;
    //   if (existingStatus !== 'granted') {
    //     const { status } = await Notifications.requestPermissionsAsync();
    //     finalStatus = status;
    //   }
    //   if (finalStatus !== 'granted') {
    //     console.log('Failed to get push token for push notification!');
    //     return;
    //   }
    //   // You can get the token here if you need to send it to backend
    //   // const token = (await Notifications.getExpoPushTokenAsync()).data;
    //   // console.log(token);
    // };

    // registerForPushNotificationsAsync();

    // notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //   // Handle foreground notification
    //   console.log('Notification received:', notification);
    // });

    // responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //   // Handle notification tap
    //   console.log('Notification tapped:', response);
    // });

    return () => {
      // notificationListener.current &&
      //   Notifications.removeNotificationSubscription(notificationListener.current);
      // responseListener.current &&
      //   Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!authUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authUser, segments, isCheckingAuth]);

  // Handle System Navigation Bar Color (Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        const buttonStyle = theme === 'dark' ? 'light' : 'dark';
        NavigationBar.setButtonStyleAsync(buttonStyle);

        if (SystemUI && SystemUI.setBackgroundColorAsync) {
          const bg = theme === 'dark' ? Colors.dark.background : Colors.light.background;
          SystemUI.setBackgroundColorAsync(bg);
        }
      } catch (error) {
        console.warn('SystemUI configuration failed:', error);
      }
    }
  }, [theme]);

  // Determine which theme to use
  const getTheme = () => {
    return theme === 'dark' ? CustomDarkTheme : CustomLightTheme;
  };

  const currentTheme = getTheme();
  const isDarkTheme = currentTheme.dark;

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkTheme ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ThemeProvider value={currentTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDarkTheme ? "light" : "dark"} backgroundColor={isDarkTheme ? Colors.dark.background : Colors.light.background} />
    </ThemeProvider>
  );
}