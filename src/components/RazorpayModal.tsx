import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Landmark,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { CartItem, Order } from '../data/db';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  studentEmail: string;
  onPaymentSuccess: (order: Order) => Promise<void> | void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  total,
  studentEmail,
  onPaymentSuccess
}) => {
  const [method, setMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [upiQrConfirmed, setUpiQrConfirmed] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentDone(false);
      setConfirmedOrder(null);
      setIsProcessing(false);
      setValidationError(null);
      setUpiQrConfirmed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const validatePaymentInputs = (): string | null => {
    if (items.length === 0) {
      return 'Your cart is empty. Add a course before completing payment.';
    }
    if (method === 'UPI') {
      const cleanUpi = upiId.trim();
      const validUpi = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(cleanUpi);
      if (!validUpi && !upiQrConfirmed) {
        return 'Enter a valid UPI ID (e.g. name@okhdfcbank) or confirm that you scanned the QR code.';
      }
    } else if (method === 'Card') {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length !== 16) {
        return 'Please enter a valid 16-digit card number.';
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        return 'Please enter a valid card expiry in MM/YY format.';
      }
      const [mmStr, yyStr] = cardExpiry.trim().split('/');
      const expYear = 2000 + Number(yyStr);
      const expMonth = Number(mmStr);
      const now = new Date();
      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
        return 'This card appears to be expired. Use a valid expiry date.';
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        return 'Please enter a valid 3 or 4 digit CVV.';
      }
    } else if (method === 'NetBanking' && !selectedBank) {
      return 'Please select a bank to proceed.';
    }
    return null;
  };

  const handleProcessPayment = async () => {
    if (isProcessing) return;
    const err = validatePaymentInputs();
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError(null);
    setIsProcessing(true);

    try {
      await new Promise((res) => setTimeout(res, 900));
      const generatedOrder: Order = {
        id: `ORD_${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: items.map((i) => ({
          id: i.course.id,
          title: i.course.title,
          price: i.course.price,
          category: i.course.category
        })),
        subtotal,
        discount,
        total,
        paymentMethod: method,
        transactionId: `pay_rzp_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        status: 'SUCCESS',
        studentEmail: studentEmail || 'student@university.edu'
      };

      await onPaymentSuccess(generatedOrder);
      setConfirmedOrder(generatedOrder);
      setPaymentDone(true);
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : 'Could not finalize enrollment. Please verify your connection and retry.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCard = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Razorpay Checkout"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-lg shadow-[12px_12px_0px_0px_#ffffff] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-4 bg-zinc-950 border-b-2 border-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white text-black font-black text-xs flex items-center justify-center font-mono-numbers">
              R
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-white">
                RAZORPAY SECURE CHECKOUT
              </div>
              <div className="text-[10px] text-zinc-400 font-mono-numbers">
                TECHIE TEACHER&apos;S TRIBE TRUST
              </div>
            </div>
          </div>

          {!paymentDone && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-white hover:text-black transition-colors disabled:opacity-40"
              aria-label="Close Razorpay modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Amount bar */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-zinc-400">Total Payable Amount</div>
          <div className="text-2xl font-black font-mono-numbers text-white">
            ₹{total.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Content Body */}
        {paymentDone && confirmedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-white text-black mx-auto flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#ffffff]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Payment Successful</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono-numbers">
                TXN ID: {confirmedOrder.transactionId}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 text-left text-xs space-y-2 font-mono-numbers">
              <div className="flex justify-between text-zinc-400">
                <span>Order Reference:</span>
                <span className="text-white font-bold">{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Date &amp; Time:</span>
                <span className="text-white">{confirmedOrder.date}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Method:</span>
                <span className="text-white">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status:</span>
                <span className="text-white font-bold">CONFIRMED (Instant Access)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              The courses and notes have been added to your Student Dashboard. You can access the lecture modules and downloadable study packs right away.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] py-3.5 bg-white text-black font-black uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#ffffff]"
            >
              <span>Go to Enrolled Content</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6">
            {validationError && (
              <div className="mb-4 p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono-numbers flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMethod('UPI');
                  setValidationError(null);
                }}
                className={`min-h-[44px] py-2 px-3 border-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                  method === 'UPI'
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('Card');
                  setValidationError(null);
                }}
                className={`min-h-[44px] py-2 px-3 border-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                  method === 'Card'
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('NetBanking');
                  setValidationError(null);
                }}
                className={`min-h-[44px] py-2 px-3 border-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                  method === 'NetBanking'
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* UPI Option */}
            {method === 'UPI' && (
              <div className="space-y-4">
                <div className="p-4 border border-zinc-800 bg-zinc-950 text-center">
                  <div className="w-32 h-32 bg-white mx-auto p-2 border-2 border-black flex flex-col items-center justify-center">
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-black">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${
                            (i * 7 + 3) % 4 === 0 || i % 5 === 0 || i < 6 || i > 29
                              ? 'bg-white'
                              : 'bg-black'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 font-mono-numbers">
                    Scan with Google Pay · PhonePe · Paytm · CRED
                  </p>
                  <label className="mt-3 inline-flex items-center gap-2 text-xs font-mono-numbers text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={upiQrConfirmed}
                      onChange={(e) => {
                        setUpiQrConfirmed(e.target.checked);
                        setValidationError(null);
                      }}
                      className="w-4 h-4 accent-white"
                    />
                    <span>I have scanned the QR in my UPI app</span>
                  </label>
                </div>

                <div className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                    Or Enter UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="student@okhdfcbank / yourname@paytm"
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>
            )}

            {/* Card Option */}
            {method === 'Card' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                    Card Number (16 Digits)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(formatCard(e.target.value));
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="4532 8901 2345 6789"
                    maxLength={19}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(formatExpiry(e.target.value));
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="08/28"
                      maxLength={5}
                      className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NetBanking Option */}
            {method === 'NetBanking' && (
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block">
                  Select Your Bank
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'HDFC Bank',
                    'State Bank of India',
                    'ICICI Bank',
                    'Axis Bank',
                    'Kotak Bank',
                    'Punjab National'
                  ].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`min-h-[44px] text-left p-2.5 text-xs font-semibold border ${
                        selectedBank === bank
                          ? 'border-white bg-white text-black font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Pay Button */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full min-h-[44px] py-3.5 bg-white text-black font-black uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing ₹{total.toLocaleString('en-IN')}...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{total.toLocaleString('en-IN')} via {method}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-zinc-500 font-mono-numbers">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>256-BIT ENCRYPTED · RAZORPAY TEST RUNTIME · PCI-DSS COMPLIANT</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
