import React, { useMemo, useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';

type OutgoingMessage = {
    text?: string;
    image?: string | null;
    video?: string | null;
    document?: {
        name: string;
        size: number;
        type: string;
        data: string;
    } | null;
};

interface ChatInputProps {
    onSend: (payload: OutgoingMessage) => Promise<void> | void;
    isLoading?: boolean;
}

export default function ChatInput({
    onSend,
    isLoading = false,
}: ChatInputProps) {
    const { theme } = useThemeStore();
    const colors = Colors[theme];
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [imagePreview, setImagePreview] = useState<{ uri: string; base64: string } | null>(null);
    const [videoPreview, setVideoPreview] = useState<{ uri: string; base64: string } | null>(null);
    const [documentPreview, setDocumentPreview] = useState<OutgoingMessage['document']>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const textInputRef = useRef<TextInput>(null);

    const hasPayload = useMemo(
        () => text.trim().length > 0 || !!imagePreview || !!videoPreview || !!documentPreview,
        [text, imagePreview, videoPreview, documentPreview]
    );

    const resetInputs = () => {
        setText('');
        setImagePreview(null);
        setVideoPreview(null);
        setDocumentPreview(null);
        setShowActions(false);
        setUploadError(null);
    };

    const handleSend = async () => {
        if (!hasPayload || isSending || isLoading || isUploading) return;

        setIsSending(true);
        setUploadError(null);

        try {
            await onSend({
                text: text.trim(),
                image: imagePreview?.base64 ?? null,
                video: videoPreview?.base64 ?? null,
                document: documentPreview ?? null,
            });
            resetInputs();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to send message";
            setUploadError(errorMsg);
        } finally {
            setIsSending(false);
        }
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'] as any,
            quality: 0.7,
            base64: true,
        });

        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset.base64 || !asset.uri) return;

        // Check size (2MB limit)
        const base64Length = asset.base64.length;
        const sizeInBytes = (base64Length * 3) / 4;
        if (sizeInBytes > 2 * 1024 * 1024) {
            setUploadError("Image must be less than 2MB");
            return;
        }

        setImagePreview({
            uri: asset.uri,
            base64: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
        });
        setShowActions(false);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            setUploadError("Camera access denied. Please allow camera access.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'] as any,
            quality: 0.7,
            base64: true,
        });

        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset.base64 || !asset.uri) return;

        // Check size (2MB limit)
        const base64Length = asset.base64.length;
        const sizeInBytes = (base64Length * 3) / 4;
        if (sizeInBytes > 2 * 1024 * 1024) {
            setUploadError("Image must be less than 2MB");
            return;
        }

        setImagePreview({
            uri: asset.uri,
            base64: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
        });
        setShowActions(false);
    };

    const pickVideo = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'] as any,
            quality: 0.7,
            base64: true,
        });

        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset.base64 || !asset.uri) return;

        // Check size (25MB limit)
        const base64Length = asset.base64.length;
        const sizeInBytes = (base64Length * 3) / 4;
        if (sizeInBytes > 25 * 1024 * 1024) {
            setUploadError("Video must be less than 25MB");
            return;
        }

        setVideoPreview({
            uri: asset.uri,
            base64: `data:${asset.mimeType || 'video/mp4'};base64,${asset.base64}`,
        });
        setShowActions(false);
    };

    const recordVideo = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            setUploadError("Camera access denied. Please allow camera access.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'] as any,
            quality: 0.7,
            base64: true,
        });

        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];
        if (!asset.base64 || !asset.uri) return;

        // Check size (25MB limit)
        const base64Length = asset.base64.length;
        const sizeInBytes = (base64Length * 3) / 4;
        if (sizeInBytes > 25 * 1024 * 1024) {
            setUploadError("Video must be less than 25MB");
            return;
        }

        setVideoPreview({
            uri: asset.uri,
            base64: `data:${asset.mimeType || 'video/mp4'};base64,${asset.base64}`,
        });
        setShowActions(false);
    };

    const pickDocument = async () => {
        setIsUploading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.length) {
                setIsUploading(false);
                return;
            }

            const file = result.assets[0];

            // Guard on large files (50MB)
            if (file.size && file.size > 50 * 1024 * 1024) {
                setUploadError("Document must be less than 50MB");
                setIsUploading(false);
                return;
            }

            const base64 = await FileSystem.readAsStringAsync(file.uri, {
                encoding: 'base64',
            });

            setDocumentPreview({
                name: file.name,
                size: file.size ?? 0,
                type: file.mimeType ?? 'application/octet-stream',
                data: `data:${file.mimeType || 'application/octet-stream'};base64,${base64}`,
            });
            setShowActions(false);
        } catch (error) {
            console.warn('Document read failed', error);
            setUploadError("Failed to load document");
        } finally {
            setIsUploading(false);
        }
    };

    // Action Grid Buttons
    const actionButtons = [
        { name: 'Gallery', icon: 'image', onPress: pickImage, color: '#10b981' },
        { name: 'Camera', icon: 'camera', onPress: takePhoto, color: '#3b82f6' },
        { name: 'Document', icon: 'file-text', onPress: pickDocument, color: '#f59e0b' },
        { name: 'Video', icon: 'video', onPress: pickVideo, color: '#8b5cf6' },
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.wrapper, { borderTopColor: colors.border, backgroundColor: colors.inputBackground }]}
        >
            {/* Upload Error Message */}
            {uploadError && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '20', borderColor: colors.error + '40' }]}>
                    <LucideIcon name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{uploadError}</Text>
                    <TouchableOpacity onPress={() => setUploadError(null)} style={styles.errorClose}>
                        <LucideIcon name="x" size={14} color={colors.error} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Previews Row */}
            {(imagePreview || videoPreview || documentPreview) && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.previewRow}
                    contentContainerStyle={styles.previewRowContent}
                >
                    {/* Image Preview */}
                    {imagePreview && (
                        <View style={[styles.previewCard, { borderColor: colors.border }]}>
                            <Image source={{ uri: imagePreview.uri }} style={styles.previewImage} />
                            <TouchableOpacity
                                onPress={() => setImagePreview(null)}
                                style={styles.previewClose}
                            >
                                <LucideIcon name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                        <View style={[styles.previewCard, { borderColor: colors.border }]}>
                            <View style={styles.videoPreviewContainer}>
                                <LucideIcon name="video" size={32} color={colors.tint} />
                                <Text style={[styles.videoLabel, { color: colors.text }]}>Video</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setVideoPreview(null)}
                                style={styles.previewClose}
                            >
                                <LucideIcon name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Document Preview */}
                    {documentPreview && (
                        <View style={[styles.previewDoc, { borderColor: colors.border, backgroundColor: colors.background }]}>
                            <LucideIcon name="file" size={20} color={colors.tint} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.previewDocName, { color: colors.text }]} numberOfLines={1}>
                                    {documentPreview.name}
                                </Text>
                                <Text style={[styles.previewDocMeta, { color: colors.icon }]}>
                                    {documentPreview.size ? (documentPreview.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDocumentPreview(null)}
                                style={styles.docPreviewClose}
                            >
                                <LucideIcon name="x" size={16} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Action Grid - appears above input */}
            {showActions && (
                <View style={[styles.actionsGrid, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {actionButtons.map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionGridItem}
                            onPress={btn.onPress}
                            disabled={isUploading}
                        >
                            <View style={[styles.actionGridIconContainer, { backgroundColor: btn.color + '20' }]}>
                                <LucideIcon name={btn.icon} size={24} color={btn.color} />
                            </View>
                            <Text style={[styles.actionGridText, { color: colors.text }]}>
                                {btn.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Input Container */}
            <View style={styles.container}>
                {/* Plus/Attachment Button */}
                <TouchableOpacity
                    onPress={() => setShowActions((v) => !v)}
                    style={styles.iconButton}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <ActivityIndicator size="small" color={colors.tint} />
                    ) : (
                        <LucideIcon
                            name={showActions ? 'x' : 'plus'}
                            size={22}
                            color={showActions ? colors.error : colors.tint}
                        />
                    )}
                </TouchableOpacity>

                {/* Input Field */}
                <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <TextInput
                        ref={textInputRef}
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Message..."
                        placeholderTextColor={colors.icon}
                        multiline
                        value={text}
                        onChangeText={setText}
                        maxLength={5000}
                    />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={isLoading || isSending || !hasPayload || isUploading}
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: hasPayload && !isLoading && !isSending && !isUploading
                                ? colors.tint
                                : colors.border,
                            opacity: hasPayload && !isLoading && !isSending && !isUploading ? 1 : 0.5
                        }
                    ]}
                >
                    {isLoading || isSending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <LucideIcon name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        marginHorizontal: 4,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    errorClose: {
        padding: 4,
    },
    previewRow: {
        marginBottom: 8,
    },
    previewRowContent: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 4,
    },
    previewCard: {
        position: 'relative',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        overflow: 'hidden',
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    videoPreviewContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    videoLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    previewClose: {
        position: 'absolute',
        top: 4,
        right: 4,
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    previewDoc: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        gap: 8,
        minWidth: 200,
        maxWidth: 280,
    },
    previewDocName: {
        fontSize: 13,
        fontWeight: '600',
    },
    previewDocMeta: {
        fontSize: 11,
        marginTop: 2,
    },
    docPreviewClose: {
        padding: 4,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginBottom: 8,
        marginHorizontal: 4,
        gap: 12,
        justifyContent: 'space-around',
    },
    actionGridItem: {
        width: '22%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    actionGridIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    actionGridText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 6,
        gap: 6,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        minHeight: 42,
        maxHeight: 120,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        maxHeight: 100,
    },
    iconButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});