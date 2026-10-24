import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ItemContato from "../components/ItemContato";

export default function ContatosScreen() {
  const [contatos, setContatos] = useState([
    { id: 1, nome: "Ana Paula", cpf: "", telefone: "(43) 99911-2233", endereco: "", nota: "Irmã" },
    { id: 2, nome: "José Carlos", cpf: "", telefone: "(43) 99822-1144", endereco: "", nota: "Pai" },
  ]);
  const [proximoId, setProximoId] = useState(3);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [nota, setNota] = useState("");

  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState("");

  function limparFormulario() {
    setNome("");
    setCpf("");
    setTelefone("");
    setEndereco("");
    setNota("");
    setIdEditando(null);
    setErro("");
  }

  function salvar() {
    if (nome === "" || telefone === "") {
      setErro("Preencha pelo menos o nome e o telefone.");
      return;
    }

    if (idEditando === null) {
      const novoContato = { id: proximoId, nome: nome, cpf: cpf, telefone: telefone, endereco: endereco, nota: nota };
      setContatos([...contatos, novoContato]);
      setProximoId(proximoId + 1);
    } else {
      setContatos(
        contatos.map((contato) =>
          contato.id === idEditando
            ? { id: contato.id, nome: nome, cpf: cpf, telefone: telefone, endereco: endereco, nota: nota }
            : contato
        )
      );
    }

    limparFormulario();
  }

  function editar(contato) {
    setNome(contato.nome);
    setCpf(contato.cpf);
    setTelefone(contato.telefone);
    setEndereco(contato.endereco);
    setNota(contato.nota);
    setIdEditando(contato.id);
  }

  function excluir(id) {
    setContatos(contatos.filter((contato) => contato.id !== id));
    if (id === idEditando) {
      limparFormulario();
    }
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
          value={telefone}
          onChangeText={setTelefone}
        />
        <TextInput
          style={estilos.input}
          placeholder="CPF"
          keyboardType="numeric"
          value={cpf}
          onChangeText={setCpf}
        />
        <TextInput style={estilos.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
        <TextInput style={estilos.input} placeholder="Nota (ex.: irmã)" value={nota} onChangeText={setNota} />

        <Text style={estilos.erro}>{erro}</Text>

        <TouchableOpacity style={estilos.botao} onPress={salvar}>
          <Text style={estilos.botaoTexto}>{idEditando === null ? "Adicionar" : "Salvar alterações"}</Text>
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