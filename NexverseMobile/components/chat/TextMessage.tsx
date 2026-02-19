import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Message } from "@/types";
import { formatMessageTime } from "@/lib/utils";

interface TextMessageProps {
    message: Message;
    isMe: boolean;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
}

// Custom WhatsApp-style double tick component
const DoubleTick = ({ color, size = 16 }: { color: string; size?: number }) => (
    <Svg width={size} height={size * 0.7} viewBox="0 0 16 11">
        <Path
            d="M4.6 7.4L1.65 4.45L0.6 5.5L4.6 9.5L12.6 1.5L11.55 0.45L4.6 7.4Z"
            fill={color}
        />
        <Path
            d="M10.6 7.4L7.65 4.45L6.6 5.5L10.6 9.5L18.6 1.5L17.55 0.45L10.6 7.4Z"
            transform="translate(-5, 0)"
            fill={color}
        />
    </Svg>
);

// Single tick component
const SingleTick = ({ color, size = 16 }: { color: string; size?: number }) => (
    <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 12 11">
        <Path
            d="M4.6 7.4L1.65 4.45L0.6 5.5L4.6 9.5L12.6 1.5L11.55 0.45L4.6 7.4Z"
            fill={color}
        />
    </Svg>
);

const TextMessage = ({
    message,
    isMe,
    isFirstInGroup = true,
    isLastInGroup = true
}: TextMessageProps) => {

    const isSeen = message.status === 'seen';

    // Nexverse Black Theme with Gold Accents
    const myBubbleColor = '#2a2a2a';      // Dark grey for sent
    const otherBubbleColor = '#1a1a1a';   // Black for received
    const bubbleColor = isMe ? myBubbleColor : otherBubbleColor;
    const tickColor = isSeen ? '#D4AF37' : '#666666';  // Gold when seen

    // Margin based on grouping
    const marginBottom = isLastInGroup ? 8 : 2;

    // Show tail only on first message in group
    const showTail = isFirstInGroup;

    return (
        <View style={[
            styles.row,
            isMe ? styles.rowMe : styles.rowOther,
            { marginBottom }
        ]}>
            <View style={[
                styles.bubble,
                { backgroundColor: bubbleColor },
                // Sharp corner only where tail attaches
                isMe ? {
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderTopRightRadius: showTail ? 0 : 8,
                    borderBottomRightRadius: 8,
                } : {
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                    borderTopLeftRadius: showTail ? 0 : 8,
                    borderBottomLeftRadius: 8,
                }
            ]}>
                {/* Tail - WhatsApp style triangle */}
                {showTail && (
                    <View style={[
                        styles.tail,
                        isMe ? styles.tailMe : styles.tailOther,
                        { borderTopColor: bubbleColor }
                    ]} />
                )}

                {/* Message Text */}
                <Text style={styles.messageText}>
                    {message.text}
                    <Text style={styles.spacer}>{"    "}</Text>
                </Text>

                {/* Time & Ticks */}
                <View style={styles.meta}>
                    <Text style={styles.time}>{formatMessageTime(message.createdAt)}</Text>
                    {isMe && (
                        isSeen ?
                            <DoubleTick color={tickColor} size={12} /> :
                            <SingleTick color={tickColor} size={12} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    rowMe: {
        justifyContent: 'flex-end',
    },
    rowOther: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '100%',
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 9,
        paddingRight: 7,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        position: 'relative',
        // Shadow
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.13,
        shadowRadius: 0.5,
    },
    tail: {
        position: 'absolute',
        top: 0,
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderRightWidth: 10,
        borderRightColor: 'transparent',
    },
    tailMe: {
        right: -9, // Adjusted to touch bubble
    },
    tailOther: {
        left: -9, // Adjusted to touch bubble
        borderRightWidth: 0,
        borderLeftWidth: 10,
        borderLeftColor: 'transparent',
    },
    messageText: {
        fontSize: 15,
        color: '#e9edef',
        lineHeight: 20,
    },
    spacer: {
        color: 'transparent',
        fontSize: 1,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: -3,
    },
    time: {
        fontSize: 11,
        color: '#8696a0',
        marginRight: 3,
    },
    ticks: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default TextMessage;