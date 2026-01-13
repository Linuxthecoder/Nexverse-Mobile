import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors } from '../../constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import LucideIcon from '@/components/LucideIcon';

// Constants
const GOLD = '#D4AF37';

// Section configuration for easy maintenance
const SECTIONS = [
  { id: 'main', title: 'Settings', icon: 'settings' },
  { id: 'appearance', title: 'Appearance', icon: 'palette' },
  { id: 'privacy', title: 'Privacy & Security', icon: 'shield' },
  { id: 'account', title: 'Account', icon: 'user' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// Setting item component
const SettingItem = React.memo<{
  icon: string;
  iconColor: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  borderColor: string;
  textColor: string;
  isLast?: boolean;
  isDanger?: boolean;
}>(({ icon, iconColor, label, onPress, rightElement, borderColor, textColor, isLast, isDanger }) => (
  <TouchableOpacity
    style={[
      styles.settingItem,
      !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor },
    ]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingItemLeft}>
      <LucideIcon
        name={icon}
        color={isDanger ? '#ff3b30' : iconColor}
        size={20}
        style={styles.settingIcon}
      />
      <Text style={[styles.settingText, { color: isDanger ? '#ff3b30' : textColor }]}>
        {label}
      </Text>
    </View>
    {rightElement}
  </TouchableOpacity>
));

// Section header component
const SectionHeader = React.memo<{
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  textColor: string;
}>(({ title, subtitle, icon, iconColor, textColor }) => (
  <View style={styles.sectionHeaderContainer}>
    <View style={styles.sectionHeaderTop}>
      <LucideIcon name={icon} color={iconColor} size={20} />
      <Text style={[styles.sectionHeaderTitle, { color: textColor }]}>{title}</Text>
    </View>
    {subtitle && (
      <Text style={[styles.sectionHeaderSubtitle, { color: textColor }]}>{subtitle}</Text>
    )}
  </View>
));

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeStore();
  const { logout, authUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SectionId>('main');

  // Memoize theme colors
  const colors = useMemo(() => ({
    background: theme === 'dark' ? Colors.dark.background : Colors.light.background,
    text: theme === 'dark' ? Colors.dark.text : Colors.light.text,
    subtext: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    tint: theme === 'dark' ? GOLD : GOLD,
    border: theme === 'dark' ? '#2a323c' : '#e0e0e0',
    cardBg: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    arrow: theme === 'dark' ? '#666' : '#ccc',
    successBg: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    successBorder: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)',
    warningBg: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)',
    warningBorder: theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.2)',
    errorBg: theme === 'dark' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.1)',
    errorBorder: theme === 'dark' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.2)',
  }), [theme]);

  const isDarkMode = theme === 'dark';

  // Callbacks
  const toggleTheme = useCallback(() => {
    setTheme(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setTheme]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You\'ll need your password to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  }, [logout]);

  const navigateToSection = useCallback((section: SectionId) => {
    setActiveSection(section);
  }, []);

  const goBack = useCallback(() => {
    setActiveSection('main');
  }, []);

  // Render main settings menu
  const renderMainMenu = () => (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      {/* Quick Settings Card */}
      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Quick Settings"
          icon="zap"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <SettingItem
          icon="moon"
          iconColor={colors.tint}
          label="Dark Mode"
          textColor={colors.text}
          borderColor={colors.border}
          rightElement={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
            />
          }
        />
        <SettingItem
          icon="bell"
          iconColor={colors.tint}
          label="Notifications"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => { }}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
          isLast
        />
      </View>

      {/* Main Sections */}
      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Customize"
          icon="settings"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <SettingItem
          icon="palette"
          iconColor={colors.tint}
          label="Appearance"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => navigateToSection('appearance')}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
        />
        <SettingItem
          icon="shield"
          iconColor={colors.tint}
          label="Privacy & Security"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => navigateToSection('privacy')}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
        />
        <SettingItem
          icon="user"
          iconColor={colors.tint}
          label="Account"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => navigateToSection('account')}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
          isLast
        />
      </View>

      {/* Help & Support */}
      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Help & Support"
          icon="help-circle"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <SettingItem
          icon="help-circle"
          iconColor={colors.tint}
          label="Help Center"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => { }}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
        />
        <SettingItem
          icon="mail"
          iconColor={colors.tint}
          label="Contact Us"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => { }}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
          isLast
        />
      </View>

      {/* Logout */}
      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SettingItem
          icon="log-out"
          iconColor="#ff3b30"
          label="Logout"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={handleLogout}
          isDanger
          isLast
        />
      </View>
    </ScrollView>
  );

  // Render appearance section
  const renderAppearanceSection = () => (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <LucideIcon name="chevron-left" color={colors.tint} size={24} />
        <Text style={[styles.backButtonText, { color: colors.tint }]}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.header, { color: colors.text }]}>Appearance</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Theme Selection"
          subtitle="Choose your preferred theme"
          icon="palette"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <SettingItem
          icon={isDarkMode ? 'moon' : 'sun'}
          iconColor={colors.tint}
          label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
          textColor={colors.text}
          borderColor={colors.border}
          rightElement={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
            />
          }
          isLast
        />
      </View>
    </ScrollView>
  );

  // Render privacy section
  const renderPrivacySection = () => (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <LucideIcon name="chevron-left" color={colors.tint} size={24} />
        <Text style={[styles.backButtonText, { color: colors.tint }]}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.header, { color: colors.text }]}>Privacy & Security</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Privacy Settings"
          subtitle="Control your privacy and visibility"
          icon="shield"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <SettingItem
          icon="eye"
          iconColor={colors.tint}
          label="Show Online Status"
          textColor={colors.text}
          borderColor={colors.border}
          rightElement={
            <Switch
              value={true}
              onValueChange={() => { }}
              trackColor={{ false: '#767577', true: colors.tint }}
            />
          }
        />
        <SettingItem
          icon="clock"
          iconColor={colors.tint}
          label="Show Last Seen"
          textColor={colors.text}
          borderColor={colors.border}
          rightElement={
            <Switch
              value={true}
              onValueChange={() => { }}
              trackColor={{ false: '#767577', true: colors.tint }}
            />
          }
        />
        <SettingItem
          icon="message-square"
          iconColor={colors.tint}
          label="Typing Indicator"
          textColor={colors.text}
          borderColor={colors.border}
          rightElement={
            <Switch
              value={true}
              onValueChange={() => { }}
              trackColor={{ false: '#767577', true: colors.tint }}
            />
          }
          isLast
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Security Information"
          subtitle="Your account security details"
          icon="lock"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <View style={[styles.securityBadge, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
          <LucideIcon name="check-circle" color={colors.tint} size={20} />
          <View style={styles.securityBadgeText}>
            <Text style={[styles.securityBadgeTitle, { color: colors.tint }]}>Account Verified</Text>
            <Text style={[styles.securityBadgeSubtitle, { color: colors.subtext }]}>
              Your email address is verified
            </Text>
          </View>
        </View>
        <View style={[styles.securityBadge, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
          <LucideIcon name="shield" color={colors.tint} size={20} />
          <View style={styles.securityBadgeText}>
            <Text style={[styles.securityBadgeTitle, { color: colors.tint }]}>Encrypted Connection</Text>
            <Text style={[styles.securityBadgeSubtitle, { color: colors.subtext }]}>
              All messages are end-to-end encrypted
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // Render account section
  const renderAccountSection = () => (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <LucideIcon name="chevron-left" color={colors.tint} size={24} />
        <Text style={[styles.backButtonText, { color: colors.tint }]}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.header, { color: colors.text }]}>Account</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SectionHeader
          title="Account Information"
          subtitle="Your profile and account details"
          icon="user"
          iconColor={colors.tint}
          textColor={colors.text}
        />
        <View style={styles.profileSection}>
          <Image
            source={{ uri: authUser?.profilePic || 'https://via.placeholder.com/80' }}
            style={[styles.profileImage, { borderColor: colors.tint }]}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {authUser?.fullName || 'User Name'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.subtext }]}>
              {authUser?.email || 'user@example.com'}
            </Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { color: GOLD }]}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
        <SettingItem
          icon="edit"
          iconColor={colors.tint}
          label="Edit Profile"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => { }}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
        />
        <SettingItem
          icon="key"
          iconColor={colors.tint}
          label="Change Password"
          textColor={colors.text}
          borderColor={colors.border}
          onPress={() => { }}
          rightElement={<Text style={[styles.settingArrow, { color: colors.arrow }]}>›</Text>}
          isLast
        />
      </View>

      <View style={[styles.warningCard, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
        <LucideIcon name="alert-triangle" color="#fbbf24" size={20} />
        <Text style={[styles.warningText, { color: colors.text }]}>
          Only log out if you remember your password. You'll need it to sign in again.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <LucideIcon name="log-out" color="#ff3b30" size={20} />
        <Text style={styles.logoutButtonText}>Logout from Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Render appropriate section based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSection();
      case 'privacy':
        return renderPrivacySection();
      case 'account':
        return renderAccountSection();
      default:
        return renderMainMenu();
    }
  };

  return <ScreenWrapper bg={colors.background}>{renderContent()}</ScreenWrapper>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderContainer: {
    marginBottom: 16,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeaderSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  securityBadgeText: {
    flex: 1,
  },
  securityBadgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityBadgeSubtitle: {
    fontSize: 13,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
  },
});