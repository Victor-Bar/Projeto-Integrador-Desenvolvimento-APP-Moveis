import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function() {
    const context = useContext(AppContext);

    if (!context)
        throw new Error("useApp deve ser utilizado dentro de AppProvider");

    return context;
}