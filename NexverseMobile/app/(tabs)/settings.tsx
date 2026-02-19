import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Switch,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import LucideIcon from "@/components/LucideIcon";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import ScreenWrapper from "@/components/ScreenWrapper";

const { width } = Dimensions.get("window");

const ProfileTab = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const colors = Colors[theme];
  const isDark = theme === "dark";

  const dynamicStyles = useMemo(() => {
    return {
      surfaceDark: isDark ? "#0D1117" : "#F9F9F9",
      surfaceCard: isDark ? "#161B22" : "#FFFFFF",
      surfaceLight: isDark ? "#21262D" : "#F0F0F0",
      foreground: isDark ? "#FFFFFF" : "#000000",
      mutedForeground: isDark ? "#8B949E" : "#666666",
      subtleForeground: isDark ? "#484F58" : "#999999",
      border: isDark ? "#30363D" : "#E1E4E8",
    };
  }, [isDark]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const MENU_SECTIONS = [
    {
      title: "Account",
      items: [
        { icon: "user", label: "Edit Profile", color: "#F4A261", onPress: () => { } },
        { icon: "shield-check", label: "Privacy & Security", color: "#10B981", onPress: () => { } },
        { icon: "bell", label: "Notifications", value: "On", color: "#8B5CF6", onPress: () => { } },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "moon",
          label: "Dark Mode",
          color: "#6366F1",
          rightElement: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: colors.tint }}
              thumbColor="#f4f3f4"
            />
          )
        },
        { icon: "globe", label: "Language", value: "English", color: "#EC4899", onPress: () => { } },
        { icon: "cloud", label: "Data & Storage", value: "1.2 GB", color: "#14B8A6", onPress: () => { } },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help-circle", label: "Help Center", color: "#F59E0B", onPress: () => { } },
        { icon: "message-circle", label: "Contact Us", color: "#3B82F6", onPress: () => { } },
        { icon: "star", label: "Rate the App", color: "#F4A261", onPress: () => { } },
      ],
    },
  ];

  return (
    <ScreenWrapper bg={dynamicStyles.surfaceDark}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBorder, { borderColor: colors.tint }]}>
              <Image
                source={authUser?.profilePic || "https://res.cloudinary.com/djp788df0/image/upload/v1736263009/profile_pics/default_avatar.png"}
                style={styles.avatarImage}
                contentFit="cover"
              />
            </View>

            <Pressable style={[styles.cameraButton, { backgroundColor: colors.tint, borderColor: dynamicStyles.surfaceDark }]}>
              <LucideIcon name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* NAME & EMAIL */}
          <Text style={[styles.nameText, { color: dynamicStyles.foreground }]}>
            {authUser?.fullName || "Nexverse User"}
          </Text>

          <Text style={[styles.emailText, { color: dynamicStyles.mutedForeground }]}>
            {authUser?.email || "user@nexverse.com"}
          </Text>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineLabel}>Online</Text>
          </View>
        </View>

        {/* MENU SECTIONS */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: dynamicStyles.mutedForeground }]}>
              {section.title}
            </Text>
            <View style={[styles.card, { backgroundColor: dynamicStyles.surfaceCard, borderRadius: BorderRadius.lg }]}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && item.onPress && { backgroundColor: dynamicStyles.surfaceLight },
                    index < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: dynamicStyles.border }
                  ]}
                >
                  <View
                    style={[styles.iconWrapper, { backgroundColor: `${item.color}20` }]}
                  >
                    <LucideIcon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuItemLabel, { color: dynamicStyles.foreground }]}>{item.label}</Text>

                  {item.rightElement ? (
                    item.rightElement
                  ) : (
                    <>
                      {item.value && (
                        <Text style={[styles.menuItemValue, { color: dynamicStyles.mutedForeground }]}>{item.value}</Text>
                      )}
                      <LucideIcon name="chevron-right" size={18} color="#6B6B70" />
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' },
            pressed && { opacity: 0.7 }
          ]}
          onPress={handleLogout}
        >
          <View style={styles.logoutContent}>
            <LucideIcon name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </View>
        </Pressable>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarBorder: {
    borderRadius: 999,
    borderWidth: 2,
    padding: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  nameText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: "bold",
    marginTop: 16,
  },
  emailText: {
    fontSize: Typography.sizes.base,
    marginTop: 4,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },
  onlineLabel: {
    color: "#22C55E",
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
  },
  sectionContainer: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: Typography.sizes.base,
    fontWeight: "500",
  },
  menuItemValue: {
    fontSize: Typography.sizes.sm,
    marginRight: 4,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButtonText: {
    marginLeft: 8,
    color: "#EF4444",
    fontWeight: "600",
    fontSize: Typography.sizes.base,
  },
});

export default ProfileTab;