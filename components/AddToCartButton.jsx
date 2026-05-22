'use client';
import React from 'react';
import { useCart } from './CartContext';
import { useRequireAuthAction } from '@/hooks/useRequireAuthAction';

export default function AddToCartButton({ product, className, children }) {
    const { addToCart } = useCart();
    const { isCheckingAuth, requireAuth } = useRequireAuthAction();

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requireAuth()) return;
        addToCart(product);
    };

    return (
        <button 
            onClick={handleAdd}
            disabled={isCheckingAuth}
            className={className}
        >
            {children || "Add to Cart"}
        </button>
    );
}
