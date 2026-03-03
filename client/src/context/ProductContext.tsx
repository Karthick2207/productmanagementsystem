import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product } from '../types';

interface ProductContextType {
    products: Product[];
    pagination: { currentPage: number; totalPages: number; totalCount: number };
    loading: boolean;
    error: string | null;
    fetchProducts: (page?: number, search?: string) => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const API_URL = 'http://localhost:5000/api/products';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(search && { search })
            });

            const response = await fetch(`${API_URL}?${query}`);
            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            setProducts(data.products);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalCount: data.totalCount
            });
        } catch (err: any) {
            setError(err.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    }, []);

    const addProduct = async (product: Omit<Product, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });
            if (!response.ok) throw new Error('Failed to add product');

            // We could append locally if we want, but it's simpler to just re-fetch the current page.
            // E.g., fetchProducts(); but typically components will handle their own fetch after state change
            const newProduct = await response.json();

            // Optimistic locally
            setProducts(prev => [newProduct, ...prev.slice(0, 4)]); // if we only show 5

        } catch (err: any) {
            setError(err.message || 'Error adding product');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id: string, updatedData: Omit<Product, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update product');

            const updatedProduct = await response.json();
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? updatedProduct : p))
            );
        } catch (err: any) {
            setError(err.message || 'Error updating product');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete product');

            setProducts((prev) => prev.filter((p) => p.id !== id));
            // You should re-fetch products to fix pagination numbers on the front end usually,
            // but this depends on component logic.
        } catch (err: any) {
            setError(err.message || 'Error deleting product');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getProduct = (id: string) => {
        return products.find((p) => p.id === id);
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                pagination,
                loading,
                error,
                fetchProducts,
                addProduct,
                updateProduct,
                deleteProduct,
                getProduct
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
