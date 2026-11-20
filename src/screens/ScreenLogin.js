import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import useAPI from '../hooks/useAPI';
import PopupContainer from '../components/PopupContainer';

export default function() {
    const { Login } = useAPI();
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function SubmitLogin() {
        if (!username.trim() || !password) {
            Alert.alert('Atenção', 'Informe o usuário e a senha.');
            return;
        }

        setIsSubmitting(true);
        try {
            await Login(username.trim(), password);
            navigation.replace('SOS');
        } catch (error) {
            Alert.alert('Não foi possível entrar', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.Screen}>
            <PopupContainer modal={false} card={false}>
                <View style={styles.Content}>
                    <View style={styles.BrandIcon}>
                        <ShieldCheck color="#D62828" size={30} />
                    </View>
                    <View style={styles.HeaderRow}>
                        <Text style={styles.Title}>Boas-vindas</Text>
                        <View style={styles.ExpirationNotice}>
                            <Text style={styles.ExpirationNoticeText}>O login expira em 1 ano</Text>
                        </View>
                    </View>
                    <Text style={styles.Subtitle}>Entre com seu usuário e senha.</Text>

                    <View style={styles.Form}>
                        <Text style={styles.Label}>Usuário</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Seu usuário"
                            placeholderTextColor="#A0A4AB"
                            autoCapitalize="none"
                            style={styles.Input}
                        />

                        <Text style={styles.Label}>Senha</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Sua senha"
                            placeholderTextColor="#A0A4AB"
                            secureTextEntry
                            style={styles.Input}
                        />

                        <TouchableOpacity style={styles.LoginButton} onPress={SubmitLogin} disabled={isSubmitting}>
                            <Text style={styles.LoginButtonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.ResetPasswordButton}
                            onPress={() => Alert.alert('Redefinir senha', 'Como não foi implementado um serviço de email só terá esse alerta.')}
                        >
                            <Text style={styles.ResetPasswordText}>Redefinir senha</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    Content: {
        width: '100%',
        maxWidth: 440,
        alignSelf: 'center',
    },
    BrandIcon: {
        width: 62,
        height: 62,
        borderRadius: 20,
        backgroundColor: '#FCE8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    HeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    Title: {
        color: '#20242B',
        fontSize: 28,
        fontWeight: '700',
        flexShrink: 1,
    },
    Subtitle: {
        color: '#737985',
        fontSize: 15,
        marginTop: 7,
        marginBottom: 16,
    },
    ExpirationNotice: {
        maxWidth: '52%',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexShrink: 1,
    },
    ExpirationNoticeText: {
        color: '#737985',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    Form: {
        padding: 20,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
    },
    Label: {
        color: '#454A54',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    Input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        color: '#20242B',
        fontSize: 15,
        paddingHorizontal: 14,
        marginBottom: 18,
        backgroundColor: '#FFFFFF',
    },
    LoginButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: '#D62828',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    LoginButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    ResetPasswordButton: {
        alignItems: 'center',
        paddingTop: 16,
    },
    ResetPasswordText: {
        color: '#D62828',
        fontSize: 14,
        fontWeight: '600',
    },
});
