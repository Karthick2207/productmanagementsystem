import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

export const ProductForm: React.FC = () => {
    const { addProduct, updateProduct, getProduct } = useProducts();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const isEditMode = Boolean(id);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && id) {
            const productToEdit = getProduct(id);
            if (productToEdit) {
                setFormData({
                    name: productToEdit.name,
                    price: productToEdit.price.toString(),
                    stock: productToEdit.stock.toString(),
                });
            } else {
                navigate('/'); // Product not found, go back
            }
        }
    }, [id, isEditMode, getProduct, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const submittedData = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
        };

        try {
            if (isEditMode && id) {
                await updateProduct(id, submittedData);
            } else {
                await addProduct(submittedData);
            }
            navigate('/');
        } catch (error: any) {
            setSubmitError(error.message || 'An error occurred while saving the product.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md">
            <header>
                <h1 className="page-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
                <Link to="/" className="btn btn-outline" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                    Back
                </Link>
            </header>

            {submitError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    {submitError}
                </div>
            )}


            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            Product Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="price">
                            Price (₹)
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="stock">
                            Stock Quantity
                        </label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            className="form-input"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
