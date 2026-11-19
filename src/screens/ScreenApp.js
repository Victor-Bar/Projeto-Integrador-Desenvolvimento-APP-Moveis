import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useAPP from '../hooks/useAPP';
import { ChevronRight, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function() {
    const { data, updateData } = useAPP();
    const navigation = useNavigation();

    function OpenNote(noteId) {
        navigation.navigate('Note', { noteId });
    }

    function AddNote() {
        let noteId = null;

        for (let i = 0; i < data.Notes.length+1; i++) {
            if (data.Notes[i] !== undefined)
                continue;

            data.Notes[i] = {
                id: i,
                title: `Nota ${i}`,
                content: ''
            }
            updateData(data);
            noteId = i;
            break;
        }

        navigation.navigate('Note', { noteId });
    }

    return (
        <SafeAreaView style={styles.Screen}>
            <View style={styles.Header}>
                <View>
                    <Text style={styles.Title}>Notas</Text>
                    <Text style={styles.Subtitle}>Ideias e lembretes, sempre por perto.</Text>
                </View>
                <TouchableOpacity onPress={AddNote} style={styles.AddButton} accessibilityLabel="Criar nota">
                    <Plus color="#FFFFFF" size={22} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={data.Notes}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.List}
                renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => OpenNote(item.id)} style={styles.NoteCard}>
                        <View style={styles.NoteCopy}>
                            <Text style={styles.NoteTitle} numberOfLines={1}>{item.title || 'Sem título'}</Text>
                        </View>
                        <ChevronRight color="#8A8F98" size={20} />
                    </TouchableOpacity>
                }
                ListEmptyComponent={
                    <View style={styles.EmptyState}>
                        <View style={styles.EmptyIcon}><Plus color="#D62828" size={22} /></View>
                        <Text style={styles.EmptyTitle}>Nenhuma nota por aqui</Text>
                        <Text style={styles.EmptyText}>Crie sua primeira nota para começar.</Text>
                    </View>
                }
            />
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
        paddingTop: 20,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    Eyebrow: {
        color: '#D62828',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    Title: {
        color: '#20242B',
        fontSize: 28,
        fontWeight: '700',
    },
    Subtitle: {
        color: '#737985',
        fontSize: 14,
        marginTop: 5,
    },
    AddButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#D62828',
        alignItems: 'center',
        justifyContent: 'center',
    },
    List: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    NoteCard: {
        minHeight: 82,
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    NoteCopy: {
        flex: 1,
        marginRight: 12,
    },
    NoteTitle: {
        color: '#20242B',
        fontSize: 16,
        fontWeight: '600',
    },
    EmptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
    EmptyIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: '#FCE8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    EmptyTitle: {
        color: '#20242B',
        fontSize: 17,
        fontWeight: '600',
    },
    EmptyText: {
        color: '#737985',
        fontSize: 14,
        marginTop: 7,
        textAlign: 'center',
    },
});
