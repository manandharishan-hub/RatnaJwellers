'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Initial load - ensuring we only access localStorage on the client
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem('ratna_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('ratna_cart', JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    const addToCart = (product) => {
        setCart((prev) => {
            // Check if product already exists (comparing by string ID)
            const existing = prev.find(item => item._id.toString() === product._id.toString());
            if (existing) {
                return prev.map(item => 
                    item._id.toString() === product._id.toString() ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true); // Auto-open drawer on addition
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item._id.toString() !== id.toString()));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item => 
            item._id.toString() === id.toString() ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart, 
            isCartOpen, setIsCartOpen, cartTotal, cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
