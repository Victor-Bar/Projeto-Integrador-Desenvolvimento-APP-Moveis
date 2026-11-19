import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScreenApp from '../screens/ScreenApp';
import ScreenNote from '../screens/ScreenNote';
import ScreenLogin from '../screens/ScreenLogin';
import ScreenSOS from '../screens/ScreenSOS';
import ScreenContatos from '../screens/ScreenContatos';
import ScreenUserConfig from '../screens/ScreenUserConfig';

const Stack = createNativeStackNavigator();

export default function() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="App" component={ScreenApp} />
                <Stack.Screen name="Note" component={ScreenNote} />
                <Stack.Screen name="Login" component={ScreenLogin} />
                <Stack.Screen name="SOS" component={ScreenSOS} />
                <Stack.Screen name="Contatos" component={ScreenContatos} />
                <Stack.Screen name="UserConfig" component={ScreenUserConfig} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}