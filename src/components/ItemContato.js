import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ItemContato({ contato, aoEditar, aoExcluir }) {
  return (
    <View style={estilos.linha}>
      <View style={estilos.textos}>
        <Text style={estilos.nome}>{contato.nome}</Text>
        <Text style={estilos.telefone}>{contato.telefone}</Text>
        <Text style={estilos.nota}>{contato.nota}</Text>
      </View>

      <TouchableOpacity onPress={() => aoEditar(contato)}>
        <Text style={estilos.editar}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => aoExcluir(contato.id)}>
        <Text style={estilos.excluir}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  textos: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: "bold",
  },
  telefone: {
    fontSize: 14,
    color: "#555555",
  },
  nota: {
    fontSize: 12,
    color: "#888888",
  },
  editar: {
    color: "#1F5FA8",
    fontWeight: "bold",
  },
  excluir: {
    color: "#D62828",
    fontWeight: "bold",
  },
});