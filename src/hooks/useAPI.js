import { useContext } from 'react';
import { APIContext } from '../contexts/APIContext';

export default function() {
    const context = useContext(APIContext);

    if (!context)
        throw new Error("useAPI deve ser utilizado dentro de APIProvider");

    return context;
}