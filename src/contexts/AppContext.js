import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { loadStorage, saveStorage, clearStorage } from '../storage/AppStore';
import initialData from '../configs/initialData';

export const AppContext = createContext();

export default function({ children }) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const dataRef = useRef(initialData);

    useEffect(() => {
        async function initialize() {
        try {
                const storedData = await loadStorage();
                if (storedData) {
                    const hasStoredContacts = Object.prototype.hasOwnProperty.call(storedData, 'Contacts');
                    const loadedData = {
                        ...initialData,
                        ...storedData,
                    };
                    delete loadedData.Contacts;
                    dataRef.current = loadedData;
                    setData(loadedData);
                    if (hasStoredContacts) {
                        await saveStorage(loadedData);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        }
        initialize();
    }, []);

    const updateData = useCallback(async (newData) => {
        const updatedData = {
            ...dataRef.current,
            ...newData,
        };
        delete updatedData.Contacts;

        await saveStorage(updatedData);
        dataRef.current = updatedData;
        setData(updatedData);
    }, []);

    const resetData = useCallback(async () => {
        await clearStorage();
        dataRef.current = initialData;
        setData(initialData);
    }, []);

    return (
        <AppContext.Provider value={{ data, loading, updateData, resetData }}>
            {children}
        </AppContext.Provider>
    );
}

