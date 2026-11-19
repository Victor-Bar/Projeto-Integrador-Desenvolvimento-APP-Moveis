import { createContext, useCallback, useMemo, useState } from 'react';
import UsersService from '../services/UsersService';
import ContatosService from '../services/ContatosService';
import SOSService from '../services/SOSService';

export const APIContext = createContext();

export default function({ children }) {
    const [user, setUser] = useState(null);

    const Login = useCallback(async (username, password) => {
        const currentUser = await UsersService.login(username, password);
        setUser(currentUser);
        return currentUser;
    }, []);

    const Logout = useCallback(async () => {
        await UsersService.logout();
        setUser(null);
    }, []);

    const CurrentUser = useCallback(async () => {
        const currentUser = await UsersService.current();
        setUser(currentUser);
        return currentUser;
    }, []);

    const LoadContacts = useCallback(async () => {
        return ContatosService.list();
    }, []);

    const GetContact = useCallback(contactId => ContatosService.get(contactId), []);
    const CreateContact = useCallback(contact => ContatosService.create(contact), []);
    const UpdateContact = useCallback(
        (contactId, contact) => ContatosService.update(contactId, contact),
        []
    );
    const DeleteContact = useCallback(contactId => ContatosService.delete(contactId), []);
    const CreateSOS = useCallback(() => SOSService.create(), []);

    const value = useMemo(
        () => ({
            user,
            Login,
            Logout,
            CurrentUser,
            LoadContacts,
            GetContact,
            CreateContact,
            UpdateContact,
            DeleteContact,
            CreateSOS,
        }),
        [
            user,
            Login,
            Logout,
            CurrentUser,
            LoadContacts,
            GetContact,
            CreateContact,
            UpdateContact,
            DeleteContact,
            CreateSOS,
        ]
    );

    return (
        <APIContext.Provider value={value}>
            {children}
        </APIContext.Provider>
    );
}
