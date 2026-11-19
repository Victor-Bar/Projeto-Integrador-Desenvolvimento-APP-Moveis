import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function PopupContainer({
    visible = false,
    onRequestClose,
    children,
    modal = true,
    card = true,
    cardStyle,
    contentContainerStyle,
    keyboardVerticalOffset = 0,
}) {
    const content = (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={styles.KeyboardAvoidingView}
        >
            <ScrollView
                style={styles.ScrollView}
                contentContainerStyle={[styles.ScrollContent, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {card ? (
                    <View style={[styles.Card, cardStyle]}>{children}</View>
                ) : children}
            </ScrollView>
        </KeyboardAvoidingView>
    );

    if (!modal) return content;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={styles.Overlay}>{content}</View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    Overlay: {
        flex: 1,
        backgroundColor: 'rgba(32, 36, 43, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    KeyboardAvoidingView: {
        flex: 1,
        width: '100%',
    },
    ScrollView: {
        flex: 1,
        width: '100%',
    },
    ScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    Card: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
    },
});
