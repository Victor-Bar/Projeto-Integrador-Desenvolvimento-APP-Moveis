import { createNativeStackNavigator } from "@react-navigation/native-stack"

import BlocoDeNotasScreen from "../screens/BlocoDeNotasScreen";
import ContatosScreen from "../screens/ContatosScreen";
import SOSScreen from "../screens/SOSScreen";

const Stack = createNativeStackNavigator();

export default function(){
    return(
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BlocoDeNotas" component={BlocoDeNotasScreen} />
            <Stack.Screen
                name="Contatos"
                component={ContatosScreen}
                options={{ headerShown: true, title: "Contatos do SOS" }}
            />
            <Stack.Screen name="SOSScreen" component={SOSScreen} />
        </Stack.Navigator>
    )
}