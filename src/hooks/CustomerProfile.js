import { useContext } from 'react';
import { CustomerProfileContext } from '../context/CustomerProfileDef';

export default function useCustomerProfile() {
    const context = useContext(CustomerProfileContext);
    if (!context) {
        throw new Error('useCustomerProfile must be used within CustomerProfileProvider');
    }
    return context;
}
