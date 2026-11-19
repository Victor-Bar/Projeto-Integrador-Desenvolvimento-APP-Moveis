import AppContext from "./contexts/AppContext";
import APIContext from "./contexts/APIContext";
import AppStack from "./navigations/AppStack";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function() {
    return (
        <SafeAreaProvider>
            <AppContext>
                <APIContext>
                        <AppStack />
                </APIContext>
            </AppContext>
        </SafeAreaProvider>
    )
}