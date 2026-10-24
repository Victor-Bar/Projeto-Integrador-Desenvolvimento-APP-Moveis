import { createNativeStackNavigator } from "@react-navigation/native-stack"

import SOSScreen from "../screens/SOSScreen";

const Stack = createNativeStackNavigator();

export default function(){
    return(
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SOSScreen" component={SOSScreen} />
        </Stack.Navigator>
    )
}