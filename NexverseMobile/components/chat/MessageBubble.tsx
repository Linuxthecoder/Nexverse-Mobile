import { Message } from "@/types";
import { View, Text, StyleSheet, Image } from "react-native";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { Colors } from "@/constants/theme";
import { formatMessageTime, formatMessageStatus } from "@/lib/utils";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
}

function MessageBubble({ message, isMe }: MessageBubbleProps) {
    const { theme } = useThemeStore();
    const colors = Colors[theme];
    const isSeen = message.status === 'seen';

    if (!message.image) return null;

    return (
        <View style={[styles.container, isMe ? styles.meContainer : styles.otherContainer]}>
            <View
                style={[
                    styles.bubble,
                    isMe
                        ? { backgroundColor: colors.outgoingMessage, borderBottomRightRadius: 2 }
                        : { backgroundColor: colors.incomingMessage, borderBottomLeftRadius: 2 },
                    { padding: 2, maxWidth: '75%' }
                ]}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: message.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={styles.imageOverlayFooter}>
                        <Text style={styles.imageTimestamp}>
                            {formatMessageTime(message.createdAt)}
                        </Text>
                        {isMe && message.status && (
                            <View style={styles.ticksContainer}>
                                <Text style={[
                                    styles.status,
                                    { color: isSeen ? '#53BDEB' : '#FFF', fontSize: 13 }
                                ]}>
                                    {formatMessageStatus(message.status)}
                                </Text>
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
        flexDirection: 'row',
        marginBottom: Spacing.xs,
        width: '100%',
    },
    meContainer: {
        justifyContent: 'flex-end' as const,
    },
    otherContainer: {
        justifyContent: 'flex-start' as const,
    },
    bubble: {
        borderRadius: BorderRadius.lg - 2,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    imageWrapper: {
        position: 'relative',
        borderRadius: BorderRadius.md - 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        aspectRatio: 0.75, // Reverted to Portrait (longer not wider)
        borderRadius: BorderRadius.md - 2,
    },
    imageOverlayFooter: {
        position: 'absolute',
        bottom: 4,
        right: 6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
    },
    imageTimestamp: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    ticksContainer: {
        marginLeft: 2,
    },
    status: {
        fontWeight: 'normal',
    },
});

export default MessageBubble;
