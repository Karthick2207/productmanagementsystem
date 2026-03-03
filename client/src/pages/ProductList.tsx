import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export const ProductList: React.FC = () => {
    const { products, pagination, loading, error, fetchProducts, deleteProduct } = useProducts();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // Initial fetch
    useEffect(() => {
        fetchProducts(pagination.currentPage, searchTerm);
    }, [pagination.currentPage, searchTerm, fetchProducts]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const confirmDelete = (id: string) => {
        setProductToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (productToDelete) {
            await deleteProduct(productToDelete);
            setDeleteModalOpen(false);
            setProductToDelete(null);

            // Refetch to get correct pagination and items
            fetchProducts(pagination.currentPage, searchTerm);
        }
    };

    const handleNextPage = () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchProducts(pagination.currentPage + 1, searchTerm);
        }
    };

    const handlePrevPage = () => {
        if (pagination.currentPage > 1) {
            fetchProducts(pagination.currentPage - 1, searchTerm);
        }
    };

    if (error) {
        return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Error: {error}</div>;
    }

    return (
        <div>
            <header>
                <h1 className="page-title">Products</h1>
                <Link to="/add" className="btn btn-primary">
                    <Plus size={18} /> Add Product
                </Link>
            </header>

            <div className="card">
                <div className="search-bar">
                    <Search size={18} className="text-secondary" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={handleSearch}
                    />
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ color: 'var(--text-secondary)' }}>Loading products...</div>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{product.name}</div>
                                        </td>
                                        <td>₹{Number(product.price).toFixed(2)}</td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor:
                                                        product.stock > 20
                                                            ? 'rgba(16, 185, 129, 0.2)'
                                                            : product.stock > 0
                                                                ? 'rgba(245, 158, 11, 0.2)'
                                                                : 'rgba(239, 68, 68, 0.2)',
                                                    color:
                                                        product.stock > 20
                                                            ? 'var(--success)'
                                                            : product.stock > 0
                                                                ? '#d97706'
                                                                : 'var(--danger)',
                                                }}
                                            >
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                <button
                                                    className="icon-button"
                                                    onClick={() => navigate(`/edit/${product.id}`)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    className="icon-button danger"
                                                    onClick={() => confirmDelete(product.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ color: 'var(--text-secondary)' }}>
                                            No products found.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Page {pagination.currentPage} of {pagination.totalPages} (Total: {pagination.totalCount})
                        </span>
                        <div className="pagination-controls">
                            <button
                                className="btn btn-outline"
                                disabled={pagination.currentPage === 1 || loading}
                                onClick={handlePrevPage}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-outline"
                                disabled={pagination.currentPage === pagination.totalPages || loading}
                                onClick={handleNextPage}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="modal-title" style={{ margin: 0 }}>Delete Product</h3>
                            <button className="icon-button" onClick={() => setDeleteModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            Are you sure you want to delete this product? This action cannot be
                            undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
