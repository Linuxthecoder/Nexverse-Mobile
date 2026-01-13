import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors } from '../../constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';

export default function ExploreScreen() {
  const { theme } = useThemeStore();
  
  // Get colors based on current theme
  const backgroundColor = theme === 'dark' ? Colors.dark.background : Colors.light.background;
  const textColor = theme === 'dark' ? Colors.dark.text : Colors.light.text;
  const iconColor = theme === 'dark' ? Colors.dark.tint : Colors.light.tint;
  const borderColor = theme === 'dark' ? '#2a323c' : '#e0e0e0';
  const actionButtonBg = theme === 'dark' ? '#1d232a' : '#fff';

  return (
    <ScreenWrapper bg={backgroundColor}>
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.header, { color: textColor }]}>Explore</Text>
        
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <LucideIcon name="users" color={iconColor} size={30} />
            <Text style={[styles.featureTitle, { color: textColor }]}>Find Friends</Text>
            <Text style={[styles.featureDescription, { color: theme === 'dark' ? Colors.dark.icon : Colors.light.icon }]}>
              Discover and connect with people nearby
            </Text>
          </View>
          <View style={styles.featureCard}>
            <LucideIcon name="star" color={iconColor} size={30} />
            <Text style={[styles.featureTitle, { color: textColor }]}>Favorites</Text>
            <Text style={[styles.featureDescription, { color: theme === 'dark' ? Colors.dark.icon : Colors.light.icon }]}>
              Access your favorite chats and contacts
            </Text>
          </View>
          <View style={styles.featureCard}>
            <LucideIcon name="bookmark" color={iconColor} size={30} />
            <Text style={[styles.featureTitle, { color: textColor }]}>Saved Messages</Text>
            <Text style={[styles.featureDescription, { color: theme === 'dark' ? Colors.dark.icon : Colors.light.icon }]}>
              Keep important messages and files handy
            </Text>
          </View>
          <View style={styles.featureCard}>
            <LucideIcon name="calendar" color={iconColor} size={30} />
            <Text style={[styles.featureTitle, { color: textColor }]}>Events</Text>
            <Text style={[styles.featureDescription, { color: theme === 'dark' ? Colors.dark.icon : Colors.light.icon }]}>
              Organize group activities and meetups
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: actionButtonBg }]}>
              <LucideIcon name="user-plus" color={iconColor} size={20} />
              <Text style={[styles.quickActionText, { color: textColor }]}>Add Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: actionButtonBg }]}>
              <LucideIcon name="qr-code" color={iconColor} size={20} />
              <Text style={[styles.quickActionText, { color: textColor }]}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: actionButtonBg }]}>
              <LucideIcon name="settings" color={iconColor} size={20} />
              <Text style={[styles.quickActionText, { color: textColor }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Activity</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.activityAvatar} />
              <View style={styles.activityDetails}>
                <Text style={[styles.activityName, { color: textColor }]}>John Doe</Text>
                <Text style={[styles.activityMessage, { color: theme === 'dark' ? Colors.dark.icon : Colors.light.icon }]}>
                  Sent you a message
                </Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.activityAvatar} />
              <View style={styles.activityDetails}>
                <Text style={[styles.activityName, { color: textColor }]}>Jane Smith</Text>
                <Text style={[styles.activityMessage, { color: theme === 'dark' ? Colors.dark.icon : Colors.light.icon }]}>
                  Joined your group
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: iconColor }]}>
            <Text style={styles.viewAllText}>View All</Text>
            <LucideIcon name="chevron-right" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '32%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'column',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityRow: {
    flexDirection: 'column',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityMessage: {
    fontSize: 14,
  },
  viewAllButton: {
    width: '100%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});