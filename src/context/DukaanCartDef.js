import { createContext } from 'react';

/**
 * Bare context object, kept in its own file so the provider module only exports
 * components (react-refresh lint rule) — same split as FoodOrderDef.
 */
export const DukaanCartContext = createContext(null);
