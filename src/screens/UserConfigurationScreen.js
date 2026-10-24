import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function UserConfigurationScreen() {
    const [usuario, setUsuario] = useState(null);

    const [form, setForm] = useState({
        nome: "",
        cpf: "",
        endereco: "",
        telefone: "",
        email: "",
    });

    const [editando, setEditando] = useState(true);

    function atualizarCampo(campo, valor) {
        setForm({ ...form, [campo]: valor });
    }

    function salvar() {
        if (form.nome.trim() === "") {
            alert("Preencha pelo menos o nome.");
            return;
        }

        setUsuario(form);
        setEditando(false);
    }

    function editar() {
        setForm(usuario);
        setEditando(true);
    }

    function excluir() {
        setUsuario(null);
        setForm({ nome: "", cpf: "", endereco: "", telefone: "", email: "" });
        setEditando(true);
    }

    return (
        <ScrollView
            style={styles.Container}
            contentContainerStyle={styles.Content}
        >
            <Text style={styles.Titulo}>Configuração do Usuário</Text>

            {editando ? (
                <View style={styles.Card}>
                    <Text style={styles.Label}>Nome</Text>
                    <TextInput
                        style={styles.Input}
                        placeholder="Digite o nome"
                        value={form.nome}
                        onChangeText={(texto) => atualizarCampo("nome", texto)}
                    />

                    <Text style={styles.Label}>CPF</Text>
                    <TextInput
                        style={styles.Input}
                        placeholder="Digite o CPF"
                        keyboardType="numeric"
                        value={form.cpf}
                        onChangeText={(texto) => atualizarCampo("cpf", texto)}
                    />

                    <Text style={styles.Label}>Endereço</Text>
                    <TextInput
                        style={styles.Input}
                        placeholder="Digite o endereço"
                        value={form.endereco}
                        onChangeText={(texto) => atualizarCampo("endereco", texto)}
                    />

                    <Text style={styles.Label}>Telefone</Text>
                    <TextInput
                        style={styles.Input}
                        placeholder="Digite o telefone"
                        keyboardType="phone-pad"
                        value={form.telefone}
                        onChangeText={(texto) => atualizarCampo("telefone", texto)}
                    />

                    <Text style={styles.Label}>E-mail</Text>
                    <TextInput
                        style={styles.Input}
                        placeholder="Digite o e-mail"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={(texto) => atualizarCampo("email", texto)}
                    />

                    <TouchableOpacity style={styles.BtnSalvar} onPress={salvar}>
                        <Text style={styles.BtnTexto}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.Card}>
                    <Text style={styles.Label}>Nome</Text>
                    <Text style={styles.Valor}>{usuario.nome}</Text>

                    <Text style={styles.Label}>CPF</Text>
                    <Text style={styles.Valor}>{usuario.cpf}</Text>

                    <Text style={styles.Label}>Endereço</Text>
                    <Text style={styles.Valor}>{usuario.endereco}</Text>

                    <Text style={styles.Label}>Telefone</Text>
                    <Text style={styles.Valor}>{usuario.telefone}</Text>

                    <Text style={styles.Label}>E-mail</Text>
                    <Text style={styles.Valor}>{usuario.email}</Text>

                    <TouchableOpacity style={styles.BtnEditar} onPress={editar}>
                        <Text style={styles.BtnTexto}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.BtnExcluir} onPress={excluir}>
                        <Text style={styles.BtnTexto}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = {
    Container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    Content: {
        padding: 20,
        gap: 16,
    },
    Titulo: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    Card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        gap: 8,
    },
    Label: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#374151",
    },
    Input: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: "#FFFFFF",
    },
    Valor: {
        fontSize: 16,
        marginBottom: 4,
    },
    BtnSalvar: {
        minHeight: 48,
        backgroundColor: "#2563EB",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    BtnEditar: {
        minHeight: 48,
        backgroundColor: "#2563EB",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    BtnExcluir: {
        minHeight: 48,
        backgroundColor: "#D62828",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    BtnTexto: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
};
