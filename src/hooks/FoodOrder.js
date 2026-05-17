import { useContext } from 'react';
import { FoodOrderContext } from '../context/FoodOrderDef';

export default function useFoodOrder() {
    const context = useContext(FoodOrderContext);
    if (!context) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}
