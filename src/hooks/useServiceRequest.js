import { useContext } from 'react';
import { ServiceRequestContext } from '../context/serviceRequestDef';

/**
 * Hook to consume the ServiceRequestContext.
 * Must be used within a <ServiceRequestProvider>.
 */
export default function useServiceRequest() {
    const context = useContext(ServiceRequestContext);
    if (!context) {
        throw new Error('useServiceRequest must be used within a ServiceRequestProvider');
    }
    return context;
}
