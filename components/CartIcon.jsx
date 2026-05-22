'use client';
import React from 'react';
import { useCart } from './CartContext';

export default function CartIcon() {
    const { cartCount, setIsCartOpen } = useCart();

    return (
        <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 hover:bg-[#E5D3B3]/20 rounded-full transition relative group"
            title="Your Selection"
        >
            <svg 
                className="w-5 h-5 text-[#3E0A1D] transition-transform group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
            </svg>
            
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#3E0A1D] text-[#E5D3B3] text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-in zoom-in duration-300">
                    {cartCount}
                </span>
            )}
        </button>
    );
}
