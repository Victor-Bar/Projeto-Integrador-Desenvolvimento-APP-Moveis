import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAPP from '../hooks/useAPP';
import { useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import PopupContainer from '../components/PopupContainer';

export default function() {
    const { data, updateData } = useAPP();
    const { CurrentUser, Logout } = useAPI();
    const navigation = useNavigation();
    const [code, setCode] = useState(data.EnterCode ?? '');
    const [isCodeEditorVisible, setIsCodeEditorVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await CurrentUser();
                setCurrentUser(user);
            } catch (error) {
                Alert.alert('Erro', `Não foi possível carregar os dados do usuário: ${error.message}`);
            }
        }

        fetchUser();
    }, []);

    function OpenCodeEditor() {
        setCode(data.EnterCode ?? '');
        setIsCodeEditorVisible(true);
    }

    function CloseCodeEditor() {
        setCode(data.EnterCode ?? '');
        setIsCodeEditorVisible(false);
    }

    async function SaveChanges() {
        await updateData({ EnterCode: code });
        setIsCodeEditorVisible(false);
    }

    async function SignOut() {
        await Logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }

    return (
        <SafeAreaView style={styles.Screen}>
            <View style={styles.Header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.BackButton} accessibilityLabel="Voltar">
                    <ChevronLeft color="#20242B" />
                </TouchableOpacity>
                <Text style={styles.HeaderTitle}>Configurações</Text>
                <View style={styles.HeaderSpacer} />
            </View>

            <View style={styles.ProfileIcon}>
                <UserRound color="#D62828" size={27} />
            </View>
            <Text style={styles.Title}>Sua conta</Text>
            <Text style={styles.Subtitle}>Informações do usuário e acesso ao SOS.</Text>

            <View style={styles.Card}>
                <Text style={styles.SectionTitle}>Dados do usuário</Text>
                <Text style={styles.Label}>Usuário</Text>
                <Text style={styles.Value}>{currentUser?.username || '...'}</Text>
                <View style={styles.Divider} />
                <Text style={styles.Label}>E-mail</Text>
                <Text style={styles.Value}>{currentUser?.email || '...'}</Text>
                <View style={styles.Divider} />
                <Text style={styles.Label}>Endereço</Text>
                <Text style={styles.Value}>
                    {currentUser ? (currentUser.address || 'Não informado') : '...'}
                </Text>
            </View>

            <View style={styles.Card}>
                <Text style={styles.SectionTitle}>Código do SOS</Text>
                <Text style={styles.Helper}>Este código pode ser usado para acessar o SOS.</Text>
                <TouchableOpacity onPress={OpenCodeEditor} style={styles.EditCodeButton}>
                    <Text style={styles.EditCodeText}>Alterar código</Text>
                    <ChevronRight color="#8A8F98" size={20} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.LogoutCard} onPress={SignOut} accessibilityRole="button">
                <Text style={styles.LogoutText}>Sair da conta</Text>
            </TouchableOpacity>

            <PopupContainer
                visible={isCodeEditorVisible}
                onRequestClose={CloseCodeEditor}
                cardStyle={styles.PopupCard}
            >
                <View style={styles.ModalHeader}>
                    <TouchableOpacity onPress={CloseCodeEditor} style={styles.ModalBackButton} accessibilityLabel="Voltar">
                        <ChevronLeft color="#20242B" />
                    </TouchableOpacity>
                    <Text style={styles.ModalTitle}>Alterar código SOS</Text>
                    <View style={styles.ModalHeaderSpacer} />
                </View>
                <Text style={styles.ModalDescription}>Digite e confira o código que deseja usar.</Text>
                <TextInput
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    placeholder="Código de acesso"
                    placeholderTextColor="#A0A4AB"
                    style={styles.Input}
                    autoFocus
                />
                <TouchableOpacity style={styles.SaveButton} onPress={SaveChanges}>
                    <Text style={styles.SaveButtonText}>Salvar código</Text>
                </TouchableOpacity>
            </PopupContainer>

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
        minHeight: 64,
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
    },
    HeaderTitle: {
        color: '#20242B',
        fontSize: 18,
        fontWeight: '700',
    },
    HeaderSpacer: {
        width: 44,
    },
    ProfileIcon: {
        width: 58,
        height: 58,
        borderRadius: 19,
        backgroundColor: '#FCE8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 18,
    },
    Title: {
        color: '#20242B',
        fontSize: 23,
        fontWeight: '700',
    },
    Subtitle: {
        color: '#737985',
        fontSize: 14,
        marginTop: 6,
        marginBottom: 22,
    },
    Card: {
        padding: 18,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        marginBottom: 14,
    },
    LogoutCard: {
        minHeight: 54,
        padding: 18,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    LogoutText: {
        color: '#D62828',
        fontSize: 15,
        fontWeight: '700',
    },
    SectionTitle: {
        color: '#20242B',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 16,
    },
    Label: {
        color: '#737985',
        fontSize: 12,
        marginBottom: 5,
    },
    Value: {
        color: '#20242B',
        fontSize: 15,
        fontWeight: '500',
    },
    Divider: {
        height: 1,
        backgroundColor: '#ECEEF1',
        marginVertical: 14,
    },
    Helper: {
        color: '#737985',
        fontSize: 13,
        lineHeight: 19,
        marginTop: -7,
        marginBottom: 14,
    },
    EditCodeButton: {
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    EditCodeText: {
        color: '#20242B',
        fontSize: 14,
        fontWeight: '600',
    },
    Input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        color: '#20242B',
        fontSize: 15,
        paddingHorizontal: 14,
        backgroundColor: '#FFFFFF',
    },
    PopupCard: {
        maxWidth: 440,
    },
    ModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    ModalBackButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ModalTitle: {
        color: '#20242B',
        fontSize: 17,
        fontWeight: '700',
    },
    ModalHeaderSpacer: {
        width: 42,
    },
    ModalDescription: {
        color: '#737985',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    SaveButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: '#D62828',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
    },
    SaveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
