import { useContext } from 'react';
import { DukaanCartContext } from '../context/DukaanCartDef';

export default function useDukaanCart() {
    const context = useContext(DukaanCartContext);
    if (!context) {
        throw new Error('useDukaanCart must be used within a DukaanCartProvider');
    }
    return context;
}
