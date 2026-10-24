import { Text, TouchableOpacity, View } from "react-native";

export default function SOSScreen({ navigation }) {
    return (
        <View style={styles.Container}>
            <View style={styles.ContainerConfig}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("UserConfiguration")}
                    style={styles.BtnConfig}
                >
                    <Text style={ styles.CardConfigTitle }>Configuração</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.BottomContent}>
                <TouchableOpacity onPress={() => alert("teste")} style={styles.BtnSOS}>
                    <Text style={styles.SOSText}>Solicitar</Text>
                    <Text style={styles.SOSText}>SOS</Text>
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
        </View>
    );
}

const styles = {
    Container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: "#F3F4F6",
    },
    CardConfigTitle: {
        minHeight: "30px",
        fontSize: "20px"
    },
    ContainerConfig: {
        alignItems: "center",
    },
    BtnConfig: {
        minHeight: 48,
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    BottomContent: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 24,
        paddingBottom: 16,
    },
    ContainerCards: {
        width: "100%",
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    Cards: {
        flex: 1,
        minHeight: 88,
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
    },
    BtnSOS: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#D62828",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    SOSText: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "bold",
    },
    CardTitle: {
        fontSize: 14,
        textAlign: "center",
    },
    CardText: {
        fontSize: 24,
        fontWeight: "bold",
    },
};