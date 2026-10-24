import { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const PALAVRA_SECRETA = "..ww";

export default function BlocoDeNotasScreen({ navigation }) {
  const [notas, setNotas] = useState([
    { id: 1, titulo: "Mercado", texto: "arroz, café, pão" },
    { id: 2, titulo: "Dentista", texto: "sexta às 14h" },
  ]);
  const [proximoId, setProximoId] = useState(3);
  const [notaAberta, setNotaAberta] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");

  function novaNota() {
    setTitulo("");
    setTexto("");
    setNotaAberta("nova");
  }

  function abrirNota(nota) {
    setTitulo(nota.titulo);
    setTexto(nota.texto);
    setNotaAberta(nota.id);
  }

  function aoDigitarTitulo(novoTitulo) {
    if (novoTitulo.includes(PALAVRA_SECRETA)) {
      setTitulo(novoTitulo.replace(PALAVRA_SECRETA, ""));
      navigation.navigate("SOSScreen");
      return;
    }
    setTitulo(novoTitulo);
  }

  function aoDigitarTexto(novoTexto) {
    if (novoTexto.includes(PALAVRA_SECRETA)) {
      setTexto(novoTexto.replace(PALAVRA_SECRETA, ""));
      navigation.navigate("SOSScreen");
      return;
    }
    setTexto(novoTexto);
  }

  function salvarNota() {
    if (notaAberta === "nova") {
      setNotas([{ id: proximoId, titulo: titulo, texto: texto }, ...notas]);
      setProximoId(proximoId + 1);
    } else {
      setNotas(notas.map((nota) => (nota.id === notaAberta ? { id: nota.id, titulo: titulo, texto: texto } : nota)));
    }
    setNotaAberta(null);
  }

  function apagarNota() {
    setNotas(notas.filter((nota) => nota.id !== notaAberta));
    setNotaAberta(null);
  }

  if (notaAberta !== null) {
    return (
      <SafeAreaView style={estilos.container}>
        <View style={estilos.barraTopo}>
          <TouchableOpacity onPress={() => setNotaAberta(null)}>
            <Text style={estilos.voltar}>‹ Notas</Text>
          </TouchableOpacity>

          <View style={estilos.acoes}>
            {notaAberta !== "nova" ? (
              <TouchableOpacity onPress={apagarNota}>
                <Text style={estilos.apagar}>Apagar</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={salvarNota}>
              <Text style={estilos.salvar}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput style={estilos.campoTitulo} value={titulo} onChangeText={aoDigitarTitulo} placeholder="Título" />

        <TextInput
          style={estilos.campoTexto}
          value={texto}
          onChangeText={aoDigitarTexto}
          placeholder="Escreva aqui..."
          multiline
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Notas</Text>

      <FlatList
        data={notas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={estilos.cartao} onPress={() => abrirNota(item)}>
            <Text style={estilos.cartaoTitulo}>{item.titulo}</Text>
            <Text style={estilos.cartaoTexto}>{item.texto}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={estilos.botaoNovo} onPress={novaNota}>
        <Text style={estilos.botaoNovoTexto}>+ Nova nota</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 16,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cartaoTitulo: {
    fontSize: 17,
    fontWeight: "bold",
  },
  cartaoTexto: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  botaoNovo: {
    backgroundColor: "#F5A623",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  botaoNovoTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  barraTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  acoes: {
    flexDirection: "row",
    gap: 20,
  },
  voltar: {
    fontSize: 18,
    color: "#F5A623",
  },
  apagar: {
    fontSize: 18,
    color: "#D62828",
  },
  salvar: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F5A623",
  },
  campoTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  campoTexto: {
    flex: 1,
    fontSize: 17,
    textAlignVertical: "top",
  },
});