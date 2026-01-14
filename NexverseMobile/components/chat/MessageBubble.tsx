import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';
import { getImageUrl } from '@/lib/utils';
import Svg, { Path } from 'react-native-svg';

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

    // Determine bubble colors based on theme
    const bubbleColor = isMe
        ? (theme === 'dark' ? '#1C1C1E' : '#FFFFFF')
        : (theme === 'dark' ? '#2C2C2E' : '#F0F0F0');

    const textColor = isMe
        ? (theme === 'dark' ? '#FFFFFF' : '#000000')
        : (theme === 'dark' ? '#FFFFFF' : '#000000');

    return (
        <View
            style={[
                styles.container,
                isMe ? styles.containerMe : styles.containerOther,
            ]}
        >
            <View style={styles.bubbleWrapper}>
                {/* Main bubble */}
                <View
                    style={[
                        styles.bubble,
                        {
                            backgroundColor: bubbleColor,
                            borderRadius: 12,
                        },
                        isMe ? styles.bubbleMe : styles.bubbleOther,
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
                            <Text style={{ fontSize: 10, color: colors.icon, marginTop: 4 }}>
                                Failed to load
                            </Text>
                        </View>
                    ) : null}

                    <Text style={[styles.messageText, { color: textColor }]}>
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

                {/* Tail */}
                <View
                    style={[
                        styles.tailContainer,
                        isMe ? styles.tailContainerMe : styles.tailContainerOther,
                    ]}
                >
                    <Svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        style={isMe ? styles.tailMe : styles.tailOther}
                    >
                        {isMe ? (
                            <Path
                                d="M 0 0 Q 0 10 10 20 L 0 20 Z"
                                fill={bubbleColor}
                            />
                        ) : (
                            <Path
                                d="M 20 0 Q 20 10 10 20 L 20 20 Z"
                                fill={bubbleColor}
                            />
                        )}
                    </Svg>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        width: '100%',
        paddingHorizontal: 16,
    },
    containerMe: {
        alignItems: 'flex-end',
    },
    containerOther: {
        alignItems: 'flex-start',
    },
    bubbleWrapper: {
        position: 'relative',
        maxWidth: '80%',
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: 22,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    bubbleMe: {
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        borderBottomLeftRadius: 4,
    },
    tailContainer: {
        position: 'absolute',
        bottom: 0,
        width: 20,
        height: 20,
    },
    tailContainerMe: {
        right: -8,
    },
    tailContainerOther: {
        left: -8,
    },
    tailMe: {
        transform: [{ scaleX: -1 }],
    },
    tailOther: {},
    image: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
    },
    imageError: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        width: 200,
        height: 150,
        alignSelf: 'center',
        marginBottom: 6,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    metadataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 6,
        right: 12,
    },
    timestamp: {
        fontSize: 10,
        marginRight: 4,
        opacity: 0.6,
    },
    readStatus: {
        marginLeft: 0,
    },
});

