import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';
import { getImageUrl } from '@/lib/utils';

interface MessageBubbleProps {
    message: string;
    timestamp: string;
    isMe: boolean;
    status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'error';
    image?: string;
}

export default function MessageBubble({
    message,
    timestamp,
    isMe,
    status,
    image,
}: MessageBubbleProps) {
    const { theme } = useThemeStore();
    const colors = Colors[theme];
    const [imageError, setImageError] = React.useState(false);

    return (
        <View
            style={[
                styles.container,
                isMe ? styles.containerMe : styles.containerOther,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isMe
                        ? { backgroundColor: colors.outgoingMessage, borderTopRightRadius: 0 }
                        : { backgroundColor: colors.incomingMessage, borderTopLeftRadius: 0 },
                    styles.shadow,
                ]}
            >
                {image && getImageUrl(image) && !imageError ? (
                    <Image
                        source={{ uri: getImageUrl(image) }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                ) : image && (imageError || !getImageUrl(image)) ? (
                    <View style={[styles.image, styles.imageError]}>
                        <LucideIcon name="image-off" size={24} color={colors.icon} />
                        <Text style={{ fontSize: 10, color: colors.icon, marginTop: 4 }}>Failed to load</Text>
                    </View>
                ) : null}

                <View style={styles.contentContainer}>
                    <Text
                        style={[
                            styles.messageText,
                            { color: colors.messageText },
                        ]}
                    >
                        {message}
                    </Text>

                    <View style={styles.metadataContainer}>
                        <Text style={[styles.timestamp, { color: colors.timestamp }]}>
                            {timestamp}
                        </Text>
                        {isMe && (
                            <View style={styles.readStatus}>
                                {status === 'sending' && (
                                    <LucideIcon name="clock" size={12} color={colors.timestamp} />
                                )}
                                {status === 'sent' && (
                                    <LucideIcon name="check" size={14} color={colors.timestamp} />
                                )}
                                {status === 'delivered' && (
                                    <LucideIcon name="check-check" size={14} color={colors.timestamp} />
                                )}
                                {status === 'seen' && (
                                    <LucideIcon name="check-check" size={14} color={colors.checkmark} />
                                )}
                                {status === 'error' && (
                                    <LucideIcon name="alert-circle" size={14} color="#FF4444" />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        width: '100%',
        paddingHorizontal: 12,
    },
    containerMe: {
        alignItems: 'flex-end',
    },
    containerOther: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 6,
        borderRadius: 12,
        minWidth: 80,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 6,
        marginBottom: 4,
    },
    imageError: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 4,
        paddingBottom: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 2,
    },
    metadataContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 2,
    },
    timestamp: {
        fontSize: 11,
        marginRight: 4,
    },
    readStatus: {
        marginLeft: 2,
    },
});
