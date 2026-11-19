import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from '@react-navigation/native';
import useAPI from "../hooks/useAPI";
import { useCallback, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from 'lucide-react-native';

export default function() {
    const { CurrentUser, CreateSOS } = useAPI();
    const navigation = useNavigation();
    const [loaded, setLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function GoBack() {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('App');
        }
    }

    async function RequestSOS() {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await CreateSOS();
            Alert.alert('SOS enviado', 'Sua solicitação foi registrada.');
        } catch (error) {
            Alert.alert('Erro', `Não foi possível enviar o SOS: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            let active = true;
            setLoaded(false);

            async function checkAuthentication() {
                try {
                    const user = await CurrentUser();
                    if (!active) return;
                    if (!user) {
                        navigation.replace('Login');
                        return;
                    }
                    setLoaded(true);
                } catch (error) {
                    if (!active) return;
                    Alert.alert('Erro', `Não foi possível verificar a sessão: ${error.message}`);
                    navigation.replace('Login');
                }
            }

            checkAuthentication();
            return () => { active = false; };
        }, [CurrentUser, navigation])
    );

    if (!loaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Carregando...</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <View style={styles.Header}>
                <TouchableOpacity onPress={GoBack} style={styles.BackButton} accessibilityLabel="Voltar">
                    <ChevronLeft color="#20242B" />
                </TouchableOpacity>
                <View style={styles.HeaderText}>
                    <Text style={styles.HeaderTitle}>SOS</Text>
                    <Text style={styles.HeaderSubtitle}>Sua rede de apoio.</Text>
                </View>
            </View>

            <View style={styles.ContainerConfig}>
                <TouchableOpacity onPress={() => navigation.navigate("UserConfig")}style={styles.BtnConfig}>
                    <Text style={ styles.CardConfigTitle }>Configuração</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Contatos")} style={[styles.BtnConfig, styles.BtnContatos]}>
                    <Text style={ styles.CardConfigTitle }>Contatos do SOS</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.BottomContent}>
                <TouchableOpacity onPress={RequestSOS} style={styles.BtnSOS} disabled={isSubmitting}>
                    <Text style={styles.SOSText}>{isSubmitting ? 'Enviando...' : 'Solicitar'}</Text>
                    {!isSubmitting && <Text style={styles.SOSText}>SOS</Text>}
                </TouchableOpacity>
                <View style={styles.ContainerCards}>
                    <TouchableOpacity style={styles.Cards}>
                        <Text style={styles.CardTitle}>Polícia Militar</Text>
                        <Text style={styles.CardText}>190</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.Cards}>
                        <Text style={styles.CardTitle}>Atendimento à Mulher</Text>
                        <Text style={styles.CardText}>180</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: '#F3F4F6',
    },

    Header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
    },

    HeaderTitle: {
        color: '#20242B',
        fontSize: 24,
        fontWeight: '700',
    },

    HeaderSubtitle: {
        color: '#737985',
        fontSize: 14,
        marginTop: 3,
    },

    CardConfigTitle: {
        minHeight: 30,
        fontSize: 20,
    },

    ContainerConfig: {
        alignItems: 'center',
    },

    BtnConfig: {
        minHeight: 48,
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    BtnContatos: {
        marginTop: 12,
    },

    BottomContent: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        paddingBottom: 16,
    },

    ContainerCards: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    Cards: {
        flex: 1,
        minHeight: 88,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },

    BtnSOS: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#D62828',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },

    SOSText: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
    },

    CardTitle: {
        fontSize: 14,
        textAlign: 'center',
    },

    CardText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});