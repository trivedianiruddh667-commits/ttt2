import React, { useState, useEffect } from 'react';
import { CartItem } from '../data/db';
import { NavPage } from '../components/Navbar';
import { Trash2, ShieldCheck, ArrowRight, ArrowLeft, Check, ShoppingBag, X } from 'lucide-react';

interface CartPageProps {
  cart: CartItem[];
  onRemoveFromCart: (courseId: string) => void;
  onNavigate: (page: NavPage) => void;
  onOpenCheckout: (discountAmount: number, appliedCode: string) => void;
  initialPromoCode?: string | null;
  onClearInitialPromoCode?: () => void;
}

const VALID_PROMO_CODES = ['TRIBE100', 'EXAMREADY', 'BLINKTRIBE', 'ZEPTOTRIBE', 'TRIBE10'];

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  onRemoveFromCart,
  onNavigate,
  onOpenCheckout,
  initialPromoCode,
  onClearInitialPromoCode
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPromoCode) {
      const cleaned = initialPromoCode.trim().toUpperCase();
      if (VALID_PROMO_CODES.includes(cleaned)) {
        setAppliedCoupon(cleaned);
        setCouponError(null);
      } else {
        setCouponCode(cleaned);
      }
      onClearInitialPromoCode?.();
    }
  }, [initialPromoCode, onClearInitialPromoCode]);

  const subtotal = cart.reduce((sum, item) => sum + item.course.price, 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'TRIBE100') {
    discount = Math.min(subtotal, 100);
  } else if (appliedCoupon === 'TRIBE10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'EXAMREADY') {
    discount = Math.round(subtotal * 0.15);
  } else if (appliedCoupon === 'BLINKTRIBE' || appliedCoupon === 'ZEPTOTRIBE') {
    discount = Math.min(subtotal, 150);
  }

  const finalTotal = Math.max(0, subtotal - discount);

  const applyCode = (raw: string) => {
    setCouponError(null);
    const cleaned = raw.trim().toUpperCase();
    if (!cleaned) {
      setCouponError('Enter a promo code to apply.');
      return;
    }

    if (VALID_PROMO_CODES.includes(cleaned)) {
      setAppliedCoupon(cleaned);
      setCouponCode('');
    } else {
      setCouponError('Invalid promo code. Try TRIBE100, EXAMREADY, TRIBE10, BLINKTRIBE or ZEPTOTRIBE');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCode(couponCode);
  };

  if (cart.length === 0) {
    return (
      <div className="w-full bg-black text-white min-h-[80vh] flex items-center justify-center p-6 select-none">
        <div className="max-w-md w-full border-4 border-white p-8 sm:p-12 text-center bg-zinc-950 shadow-[10px_10px_0px_0px_#ffffff]">
          <div className="w-16 h-16 bg-white text-black mx-auto flex items-center justify-center border-2 border-black mb-6">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-heading font-black uppercase">
            Your Cart is Empty
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            You haven&apos;t added any semester courses or handwritten formula sheets yet.
          </p>
          {appliedCoupon && (
            <div className="mt-4 p-2.5 border border-zinc-700 bg-black text-[11px] font-mono-numbers text-zinc-300">
              Promo <strong className="text-white">{appliedCoupon}</strong> saved — add a course to apply it at checkout!
            </div>
          )}
          <button
            onClick={() => onNavigate('courses')}
            className="mt-8 min-h-[44px] w-full py-3.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]"
          >
            Explore Courses Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white select-none min-h-screen">
      {/* Header section */}
      <section className="border-b-2 border-white py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
              CHECKOUT VAULT
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase mt-1">
              Review Cart ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
            </h1>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="min-h-[44px] px-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Continue Browsing</span>
          </button>
        </div>
      </section>

      {/* Main Cart Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.course.id}
                className="p-6 bg-zinc-950 border-2 border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#ffffff]"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400">
                    <span>{item.course.code}</span>
                    <span>·</span>
                    <span className="border border-zinc-700 px-1.5 py-0.5 text-white">
                      {item.course.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-black uppercase text-white leading-snug">
                    {item.course.title}
                  </h3>

                  <div className="text-xs text-zinc-400">
                    Instructor: <strong className="text-zinc-200">{item.course.teacher}</strong> · {item.course.duration}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  <div className="text-left sm:text-right">
                    <div className="text-xl font-black font-mono-numbers text-white">
                      ₹{item.course.price}
                    </div>
                    <div className="text-[10px] text-zinc-500 line-through font-mono-numbers">
                      ₹{item.course.originalPrice}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(item.course.id)}
                    className="min-h-[44px] min-w-[44px] p-2.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                    aria-label={`Remove ${item.course.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="p-4 border border-zinc-800 bg-black flex items-center justify-between text-xs text-zinc-400 font-mono-numbers">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>INSTANT ENROLLMENT UPON RAZORPAY SETTLEMENT</span>
              </div>
              <span className="hidden sm:inline">256-BIT ENCRYPTION</span>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4">
            <div className="p-6 sm:p-8 bg-zinc-950 border-4 border-white shadow-[8px_8px_0px_0px_#ffffff] space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  ORDER SUMMARY
                </span>
                <h3 className="text-xl font-heading font-black uppercase mt-1">
                  Payment Total
                </h3>
              </div>

              {/* Coupon Form */}
              <div className="space-y-2.5">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon: TRIBE100"
                    className="flex-1 min-h-[44px] bg-black border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-white font-mono-numbers"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-4 py-2 bg-white text-black text-xs font-black uppercase hover:bg-zinc-200 transition-colors border border-white"
                  >
                    Apply
                  </button>
                </form>

                {/* Quick promo chips */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono-numbers">
                  {(['TRIBE100', 'EXAMREADY', 'TRIBE10'] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => applyCode(code)}
                      className="px-2 py-1 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white uppercase transition-colors"
                    >
                      Use {code}
                    </button>
                  ))}
                </div>

                {appliedCoupon && (
                  <div className="p-2 border border-emerald-500/70 bg-black text-[11px] font-mono-numbers text-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Coupon &apos;{appliedCoupon}&apos; applied (-₹{discount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      aria-label="Remove coupon"
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {couponError && (
                  <div className="text-[11px] font-mono-numbers text-red-300">
                    {couponError}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs font-mono-numbers">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon}):</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Student Gateway Fee:</span>
                  <span className="text-white font-bold">₹0 (FREE)</span>
                </div>

                <div className="flex justify-between text-base font-black pt-3 border-t-2 border-white text-white">
                  <span>Total Payable:</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => onOpenCheckout(discount, appliedCoupon || '')}
                className="min-h-[48px] w-full py-4 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]"
              >
                <span>Pay ₹{finalTotal.toLocaleString('en-IN')} with Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-zinc-500 text-center font-mono-numbers">
                Supports UPI (GPay, PhonePe, Paytm, QR), Debit/Credit Cards & Net Banking.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
