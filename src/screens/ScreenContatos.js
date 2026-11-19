import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, Plus, UserRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import useAPI from '../hooks/useAPI';
import PopupContainer from '../components/PopupContainer';

export default function() {
    const {
        CurrentUser,
        LoadContacts,
        CreateContact,
        UpdateContact,
        DeleteContact,
    } = useAPI();
    const navigation = useNavigation();
    const [isContactModalVisible, setIsContactModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relationship, setRelationship] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchContacts() {
            try {
                const user = await CurrentUser();
                if (!active) return;
                if (!user) {
                    navigation.replace('Login');
                    return;
                }
                const savedContacts = await LoadContacts();
                if (!active) return;
                setCurrentUser(user);
                setContacts(savedContacts);
            } catch (error) {
                if (active) {
                    Alert.alert('Erro', `Não foi possível carregar os contatos: ${error.message}`);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }

        fetchContacts();
        return () => { active = false; };
    }, []);

    function OpenContactModal() {
        setSelectedContact(null);
        setName('');
        setPhone('');
        setRelationship('');
        setIsContactModalVisible(true);
    }

    function CloseContactModal() {
        setIsContactModalVisible(false);
        setSelectedContact(null);
    }

    function OpenContactDetails(contact) {
        setSelectedContact(contact);
        setIsDetailsModalVisible(true);
    }

    function EditSelectedContact() {
        if (!selectedContact) return;
        setName(selectedContact.name || '');
        setPhone(selectedContact.phone || '');
        setRelationship(selectedContact.relationship || '');
        setIsDetailsModalVisible(false);
        setIsContactModalVisible(true);
    }

    async function SaveContact() {
        try {
            const contactData = { name, phone, relationship };
            const updatedContacts = selectedContact
                ? await UpdateContact(selectedContact.id, contactData)
                : await CreateContact(contactData);
            setContacts(updatedContacts);
            CloseContactModal();
        } catch (error) {
            Alert.alert('Erro', `Não foi possível salvar o contato: ${error.message}`);
        }
    }

    function DeleteSelectedContact() {
        if (!selectedContact) return;

        Alert.alert(
            'Excluir contato',
            `Deseja excluir ${selectedContact.name || 'este contato'}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedContacts = await DeleteContact(selectedContact.id);
                            setContacts(updatedContacts);
                            setIsDetailsModalVisible(false);
                            setSelectedContact(null);
                        } catch (error) {
                            Alert.alert('Erro', `Não foi possível excluir o contato: ${error.message}`);
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.Screen}>
            <View style={styles.Header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.BackButton} accessibilityLabel="Voltar para SOS">
                    <ChevronLeft color="#20242B" />
                </TouchableOpacity>
                <View style={styles.HeaderText}>
                    <Text style={styles.Title}>Contatos</Text>
                    <Text style={styles.Subtitle}>Pessoas importantes para você.</Text>
                </View>
                <TouchableOpacity onPress={OpenContactModal} style={styles.AddButton} accessibilityLabel="Adicionar contato" disabled={isLoading || !currentUser}>
                    <Plus color="#FFFFFF" size={22} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={contacts}
                keyExtractor={(item, index) => String(item.id ?? index)}
                contentContainerStyle={styles.List}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.ContactCard}
                        onPress={() => OpenContactDetails(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver contato ${item.name || 'Contato'}`}
                    >
                        <View style={styles.ContactIcon}>
                            <UserRound color="#D62828" size={20} />
                        </View>
                        <View style={styles.ContactInfo}>
                            <Text style={styles.ContactName} numberOfLines={1}>{item.name || 'Contato'}</Text>
                            <Text style={styles.ContactPhone} numberOfLines={1}>{item.phone || 'Telefone não informado'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={isLoading ? (
                    <View style={styles.EmptyState}>
                        <Text style={styles.EmptyText}>...</Text>
                    </View>
                ) : (
                    <View style={styles.EmptyState}>
                        <Text style={styles.EmptyText}>Nenhum contato cadastrado.</Text>
                    </View>
                )}
            />
            <PopupContainer
                visible={isContactModalVisible}
                onRequestClose={CloseContactModal}
            >
                <View style={styles.ModalHeader}>
                    <TouchableOpacity onPress={CloseContactModal} style={styles.ModalBackButton} accessibilityLabel="Voltar">
                        <ChevronLeft color="#20242B" />
                    </TouchableOpacity>
                    <View style={styles.ModalHeaderText}>
                        <Text style={styles.ModalEyebrow}>CONTATOS DO SOS</Text>
                        <Text style={styles.ModalTitle}>{selectedContact ? 'Editar contato' : 'Novo contato'}</Text>
                    </View>
                    <View style={styles.ModalHeaderSpacer} />
                </View>

                <Text style={styles.ModalSubtitle}>
                    {selectedContact ? 'Atualize os dados deste contato.' : 'Adicione alguém de confiança.'}
                </Text>

                <View style={styles.ModalForm}>
                    <View style={styles.ModalFormHeading}>
                        <UserRound color="#D62828" size={20} />
                        <Text style={styles.ModalFormTitle}>Dados do contato</Text>
                    </View>
                    <Text style={styles.ModalLabel}>Nome</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Nome completo"
                        placeholderTextColor="#A0A4AB"
                        style={styles.ModalInput}
                    />

                    <Text style={styles.ModalLabel}>Telefone</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#A0A4AB"
                        keyboardType="phone-pad"
                        style={styles.ModalInput}
                    />

                    <Text style={styles.ModalLabel}>Relação</Text>
                    <TextInput
                        value={relationship}
                        onChangeText={setRelationship}
                        placeholder="Ex.: familiar, amiga..."
                        placeholderTextColor="#A0A4AB"
                        style={styles.ModalInput}
                    />
                </View>

                <TouchableOpacity style={styles.ModalSaveButton} onPress={SaveContact}>
                    <Text style={styles.ModalSaveButtonText}>
                        {selectedContact ? 'Salvar alterações' : 'Salvar contato'}
                    </Text>
                </TouchableOpacity>
            </PopupContainer>

            <PopupContainer
                visible={isDetailsModalVisible}
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <View style={styles.ModalHeader}>
                    <TouchableOpacity
                        onPress={() => setIsDetailsModalVisible(false)}
                        style={styles.ModalBackButton}
                        accessibilityLabel="Fechar detalhes"
                    >
                        <ChevronLeft color="#20242B" />
                    </TouchableOpacity>
                    <View style={styles.ModalHeaderText}>
                        <Text style={styles.ModalEyebrow}>CONTATOS DO SOS</Text>
                        <Text style={styles.ModalTitle}>Detalhes do contato</Text>
                    </View>
                    <View style={styles.ModalHeaderSpacer} />
                </View>

                <Text style={styles.DetailLabel}>Nome</Text>
                <Text style={styles.DetailValue}>{selectedContact?.name || 'Contato'}</Text>
                <Text style={styles.DetailLabel}>Telefone</Text>
                <Text style={styles.DetailValue}>{selectedContact?.phone || 'Telefone não informado'}</Text>
                <Text style={styles.DetailLabel}>Relação</Text>
                <Text style={styles.DetailValue}>{selectedContact?.relationship || 'Não informada'}</Text>

                <View style={styles.DetailActions}>
                    <TouchableOpacity
                        style={[styles.DetailActionButton, styles.DetailEditButton]}
                        onPress={EditSelectedContact}
                    >
                        <Text style={styles.DetailEditText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.DetailActionButton, styles.DetailDeleteButton]}
                        onPress={DeleteSelectedContact}
                    >
                        <Text style={styles.DetailDeleteText}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </PopupContainer>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ModalBackButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    ModalHeaderText: {
        flex: 1,
    },
    ModalHeaderSpacer: {
        width: 42,
    },
    ModalEyebrow: {
        color: '#D62828',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    ModalTitle: {
        color: '#20242B',
        fontSize: 21,
        fontWeight: '700',
    },
    ModalSubtitle: {
        color: '#737985',
        fontSize: 14,
        marginTop: 16,
        marginBottom: 18,
    },
    DetailLabel: {
        color: '#737985',
        fontSize: 13,
        marginTop: 16,
        marginBottom: 5,
    },
    DetailValue: {
        color: '#20242B',
        fontSize: 16,
        fontWeight: '600',
    },
    DetailActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 24,
    },
    DetailActionButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    DetailEditButton: {
        backgroundColor: '#F3F4F6',
    },
    DetailDeleteButton: {
        backgroundColor: '#FCE8E8',
    },
    DetailEditText: {
        color: '#20242B',
        fontSize: 15,
        fontWeight: '600',
    },
    DetailDeleteText: {
        color: '#D62828',
        fontSize: 15,
        fontWeight: '600',
    },
    ModalForm: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
    },
    ModalFormHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    ModalFormTitle: {
        color: '#20242B',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 9,
    },
    ModalLabel: {
        color: '#454A54',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    ModalInput: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        color: '#20242B',
        fontSize: 15,
        paddingHorizontal: 14,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    ModalSaveButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: '#D62828',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    ModalSaveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
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
    BackButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    HeaderText: {
        flex: 1,
        marginRight: 12,
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
        paddingTop: 18,
        paddingBottom: 20,
    },
    EmptyState: {
        paddingTop: 48,
        alignItems: 'center',
    },
    EmptyText: {
        color: '#737985',
        fontSize: 14,
    },
    ContactCard: {
        minHeight: 76,
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ContactIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FCE8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    ContactInfo: {
        flex: 1,
    },
    ContactName: {
        color: '#20242B',
        fontSize: 15,
        fontWeight: '600',
    },
    ContactPhone: {
        color: '#737985',
        fontSize: 13,
        marginTop: 5,
    },
});
