import { useState, useEffect, useCallback } from 'react';
import { getApiErrorMessage } from '../api/client';
import { getDukaanCategories, getDukaanProducts } from '../api/service/dukaanService';
import useAuth from '../hooks/useAuth';

/**
 * ══════════════════════════════════════════════════════════════
 * DUKAAN STOREFRONT VIEW MODEL (Layer 2 — Logic & State)
 * ══════════════════════════════════════════════════════════════
 * Owns the browse screen: categories, the product list, and the search / filter /
 * sort state that drives it. Search is debounced so typing does not fire a
 * request per keystroke.
 */
export function useDukaanViewModel() {
    const { hotelId } = useAuth();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Filter state
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sort, setSort] = useState('RELEVANCE');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(0);
    const LIMIT = 20;

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(0);
        }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchCategories = useCallback(async () => {
        if (!hotelId) return;
        try {
            const res = await getDukaanCategories(hotelId);
            setCategories(res?.data?.categories || []);
        } catch {
            // A failed category fetch must not blank the shop — the product grid
            // still works without the chips.
            setCategories([]);
        }
    }, [hotelId]);

    const fetchProducts = useCallback(
        async (pageToLoad = 0, append = false) => {
            if (!hotelId) return;
            append ? setLoadingMore(true) : setLoading(true);
            setError(null);
            try {
                const res = await getDukaanProducts({
                    hotelId,
                    search: debouncedSearch || undefined,
                    categoryId: categoryId || undefined,
                    sort,
                    inStockOnly: inStockOnly || undefined,
                    minPrice: minPrice !== '' ? Number(minPrice) : undefined,
                    maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
                    skip: pageToLoad * LIMIT,
                    limit: LIMIT,
                });
                const list = res?.data?.products || [];
                setProducts((prev) => (append ? [...prev, ...list] : list));
                setTotalCount(res?.data?.totalCount || 0);
            } catch (err) {
                setError(getApiErrorMessage(err, 'Could not load the shop.'));
                if (!append) setProducts([]);
            } finally {
                append ? setLoadingMore(false) : setLoading(false);
            }
        },
        [hotelId, debouncedSearch, categoryId, sort, inStockOnly, minPrice, maxPrice],
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        setPage(0);
        fetchProducts(0, false);
    }, [fetchProducts]);

    const loadMore = useCallback(() => {
        const next = page + 1;
        if (products.length >= totalCount) return;
        setPage(next);
        fetchProducts(next, true);
    }, [page, products.length, totalCount, fetchProducts]);

    const clearFilters = useCallback(() => {
        setCategoryId('');
        setSort('RELEVANCE');
        setInStockOnly(false);
        setMinPrice('');
        setMaxPrice('');
    }, []);

    const hasActiveFilters =
        Boolean(categoryId) || inStockOnly || minPrice !== '' || maxPrice !== '' || sort !== 'RELEVANCE';

    return {
        categories,
        products,
        totalCount,
        loading,
        loadingMore,
        error,
        search,
        setSearch,
        categoryId,
        setCategoryId,
        sort,
        setSort,
        inStockOnly,
        setInStockOnly,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        hasActiveFilters,
        clearFilters,
        hasMore: products.length < totalCount,
        loadMore,
        retry: () => fetchProducts(0, false),
    };
}
