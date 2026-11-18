import { useState, useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ItemContato from "../components/ItemContato";
import { API_URL } from "../config/api";

const ID_USUARIO = 1;

export default function ContatosScreen() {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [nota, setNota] = useState("");

  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");
    async function getContatos() {
    try {
      setErroLista(null);
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/contatos`);
      if (!resposta.ok) {
        throw new Error(`O servidor respondeu com erro: ${resposta.status}`);
      }
      const dados = await resposta.json();
      setContatos(dados);
    } catch (erro) {
      setErroLista(`Erro ao carregar os contatos: ${erro.message}`);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    getContatos();
  }, []);

  function limparFormulario() {
    setNome("");
    setCpf("");
    setTelefone("");
    setEndereco("");
    setNota("");
    setIdEditando(null);
    setErro("");
  }

  async function salvar() {
        const apenasNumerosTelefone = telefone.replace(/\D/g, "");
    const apenasNumerosCpf = cpf.replace(/\D/g, "");

    if (!nome.trim() || !telefone.trim()) {
      setErro("Preencha pelo menos o nome e o telefone.");
      return;
    }
    if (nome.trim().length < 3) {
      setErro("O nome precisa ter pelo menos 3 letras.");
      return;
    }
    if (/[0-9]/.test(nome)) {
      setErro("O nome não pode ter números.");
      return;
    }
    if (apenasNumerosTelefone.length < 10 || apenasNumerosTelefone.length > 11) {
      setErro("O telefone precisa ter 10 ou 11 números, com DDD.");
      return;
    }
    if (apenasNumerosCpf.length > 0 && apenasNumerosCpf.length !== 11) {
      setErro("O CPF precisa ter 11 números.");
      return;
    
    }

    setEnviando(true);

    try {
      const contato = { idUsuario: ID_USUARIO, nome, cpf, telefone, endereco, nota };
      let resposta;

      if (idEditando === null) {
        resposta = await fetch(`${API_URL}/contatos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contato),
        });
      } else {
        resposta = await fetch(`${API_URL}/contatos/${idEditando}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contato),
        });
      }

      if (!resposta.ok) {
        throw new Error(`O servidor respondeu com erro: ${resposta.status}`);
      }

      limparFormulario();
      getContatos();
    } catch (erro) {
      setErro(`Erro ao salvar o contato: ${erro.message}`);
    } finally {
      setEnviando(false);
    }
  }

  function editar(contato) {
    setNome(contato.nome);
    setCpf(contato.cpf);
    setTelefone(contato.telefone);
    setEndereco(contato.endereco);
    setNota(contato.nota);
    setIdEditando(contato.id);
  }

  async function excluir(id) {
    try {
      const resposta = await fetch(`${API_URL}/contatos/${id}`, { method: "DELETE" });
      if (!resposta.ok) {
        throw new Error(`O servidor respondeu com erro: ${resposta.status}`);
      }
      if (id === idEditando) {
        limparFormulario();
      }
      getContatos();
    } catch (erro) {
      setErro(`Erro ao excluir o contato: ${erro.message}`);
    }
  }
  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" />
        <Text>Carregando os contatos...</Text>
      </View>
    );
  }

  if (erroLista) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.erro}>{erroLista}</Text>
        <TouchableOpacity style={estilos.botao} onPress={getContatos}>
          <Text style={estilos.botaoTexto}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={estilos.container}>
      <View style={estilos.formulario}>
        <Text style={estilos.titulo}>{idEditando === null ? "Adicionar contato" : "Editar contato"}</Text>

        <TextInput style={estilos.input} placeholder="Nome *" value={nome} onChangeText={setNome} />
           <TextInput
          style={estilos.input}
          placeholder="Telefone *"
          keyboardType="phone-pad"
          maxLength={15}
          value={telefone}
          onChangeText={setTelefone}
        />
             <TextInput
          style={estilos.input}
          placeholder="CPF"
          keyboardType="numeric"
          maxLength={14}
          value={cpf}
          onChangeText={setCpf}
        />
        <TextInput style={estilos.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
        <TextInput style={estilos.input} placeholder="Nota (ex.: irmã)" value={nota} onChangeText={setNota} />

        <Text style={estilos.erro}>{erro}</Text>

        <TouchableOpacity style={estilos.botao} onPress={salvar}>
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.botaoTexto}>{idEditando === null ? "Adicionar" : "Salvar alterações"}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={estilos.subtitulo}>Quem será avisado</Text>

      <View style={estilos.policia}>
        <Text style={estilos.policiaNome}>Polícia Militar</Text>
        <Text style={estilos.policiaTelefone}>190 · contato fixo</Text>
      </View>

      <FlatList
        data={contatos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ItemContato contato={item} aoEditar={editar} aoExcluir={excluir} />}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
    centro: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  formulario: {
    marginBottom: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 8,
  },
  erro: {
    color: "#D62828",
  },
  botao: {
    backgroundColor: "#1F5FA8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  policia: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#D62828",
  },
  policiaNome: {
    fontSize: 16,
    fontWeight: "bold",
  },
  policiaTelefone: {
    fontSize: 14,
    color: "#555555",
  },
});