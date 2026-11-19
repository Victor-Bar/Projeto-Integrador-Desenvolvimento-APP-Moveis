import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Trash } from 'lucide-react-native';
import useAPP from '../hooks/useAPP';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function({ route }) {
    const { data, loading, updateData } = useAPP();
    const navigation = useNavigation();
    const { noteId } = route.params;
    const note = data.Notes[noteId];
    const [title, setTitle] = useState(note?.title ?? '');
    const [content, setContent] = useState(note?.content ?? '');

    function UpdateNote() {
        const updatedNotes = [...data.Notes];

        if (content.includes(data.EnterCode))
            navigation.navigate('SOS');

        updatedNotes[noteId] = {
            ...updatedNotes[noteId],
            title,
            content
        };

        updateData({
            ...data,
            Notes: updatedNotes
        });
    }

    function DeleteNote() {
        const updatedNotes = data.Notes.filter(
            (_, index) => index !== noteId
        );

        updateData({
            ...data,
            Notes: updatedNotes
        });

        navigation.goBack();
    }

    function Back() {
        UpdateNote();
        navigation.goBack();
    }

    function UpdateContent(newContent) {
        if (newContent.includes(data.EnterCode)) {
            newContent = newContent.replace(data.EnterCode, '');
            navigation.navigate('SOS');
        }
        setContent(newContent);
    }

    if (loading)
        return (
            <SafeAreaView style={styles.Screen}>
                <View style={styles.Header}>
                    <Text>Carregando...</Text>
                    <TouchableOpacity onPress={Back} style={styles.IconButton} accessibilityLabel="Voltar">
                        <ChevronLeft />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )

    return (
        <SafeAreaView style={styles.Screen}>
            <View style={styles.Header}>
                <TouchableOpacity onPress={Back} style={styles.IconButton} accessibilityLabel="Voltar">
                    <ChevronLeft />
                </TouchableOpacity>
                <TouchableOpacity onPress={DeleteNote} style={styles.IconButton} accessibilityLabel="Excluir nota">
                    <Trash color="#D62828" />
                </TouchableOpacity>
            </View>
            <View style={styles.Editor}>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Título da nota"
                    placeholderTextColor="#A0A4AB"
                    style={styles.TitleInput}
                />
                <TextInput
                    value={content}
                    onChangeText={(content) => UpdateContent(content)}
                    placeholder="Escreva sua nota..."
                    placeholderTextColor="#A0A4AB"
                    multiline
                    textAlignVertical="top"
                    style={styles.ContentInput}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    Screen: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 20,
    },
    Header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    IconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    Editor: {
        flex: 1,
        marginTop: 12,
        marginBottom: 20,
        padding: 20,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
    },
    TitleInput: {
        color: '#20242B',
        fontSize: 24,
        fontWeight: '700',
        paddingVertical: 8,
    },
    ContentInput: {
        flex: 1,
        color: '#454A54',
        fontSize: 16,
        lineHeight: 24,
        paddingTop: 14,
    },
});