'use client';
import React from 'react';
import { useCart } from './CartContext';

export default function AddToCartButton({ product, className, children }) {
    const { addToCart } = useCart();

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <button 
            onClick={handleAdd}
            className={className}
        >
            {children || "Add to Cart"}
        </button>
    );
}
