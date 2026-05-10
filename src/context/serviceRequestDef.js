import { createContext } from 'react';

/**
 * The raw context object for ServiceRequest.
 * Separated from the Provider component so React Fast Refresh works correctly.
 */
export const ServiceRequestContext = createContext(null);
