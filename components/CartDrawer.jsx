'use client';
import React from 'react';
import { useCart } from './CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 w-full max-w-md h-full bg-[#FCFAF8] z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                {/* Header */}
                <div className="p-6 border-b border-[#E5D3B3]/30 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-serif text-[#3E0A1D]">Shopping Cart</h2>
                        <p className="text-[10px] uppercase tracking-widest text-[#3E0A1D]/40 font-bold mt-1">
                            {cart.length === 0 ? "Your cart is empty" : `${cart.length} items added`}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-[#E5D3B3]/20 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-[#3E0A1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
                            <svg className="w-12 h-12 text-[#3E0A1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="font-serif italic text-lg">No rarities found</p>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="text-[10px] uppercase tracking-widest font-bold border-b border-[#3E0A1D] pb-1"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item._id} className="flex gap-6 group">
                                <div className="w-24 h-32 bg-white flex-shrink-0 border border-[#E5D3B3]/20 overflow-hidden relative">
                                    <Image
                                        src={item.imageUrl || "/favicon.ico"}
                                        alt={item.name}
                                        fill
                                        sizes="96px"
                                        unoptimized
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="flex-grow flex flex-col justify-between py-1">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-serif text-[#3E0A1D] text-sm">{item.name}</h3>
                                            <button 
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-[#3E0A1D]/30 hover:text-red-800 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-[9px] uppercase tracking-widest text-[#3E0A1D]/40">{item.material}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center border border-[#E5D3B3]/30">
                                            <button 
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="px-3 py-1 hover:bg-[#E5D3B3]/10 text-xs text-[#3E0A1D]"
                                            >-</button>
                                            <span className="px-2 text-[10px] font-bold text-[#3E0A1D]">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="px-3 py-1 hover:bg-[#E5D3B3]/10 text-xs text-[#3E0A1D]"
                                            >+</button>
                                        </div>
                                        <span className="font-sans text-sm font-bold text-[#3E0A1D]">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#E5D3B3]/30 bg-white space-y-6">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#3E0A1D]/40">Subtotal</span>
                        <span className="text-2xl font-serif text-[#3E0A1D]">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="space-y-3">
                        <Link 
                            href="/checkout" 
                            onClick={() => setIsCartOpen(false)}
                            className={`w-full py-5 block text-center bg-[#3E0A1D] text-[#FCFAF8] text-[10px] uppercase tracking-[0.4em] font-bold transition-all hover:bg-[#2a0714] shadow-xl ${cart.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Proceed to Checkout
                        </Link>
                        <button 
                            onClick={() => setIsCartOpen(false)}
                            className="w-full text-center text-[9px] uppercase tracking-widest font-bold text-[#3E0A1D]/40 hover:text-[#3E0A1D] transition-colors"
                        >
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
