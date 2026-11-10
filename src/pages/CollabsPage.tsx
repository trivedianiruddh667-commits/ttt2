import React, { useState } from 'react';
import { SloganBanner } from '../components/SloganBanner';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { Copy, Check, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { NavPage } from '../components/Navbar';
import { SiteContent } from '../data/siteContent';
import { copyTextSafely } from '../lib/downloadUtils';

interface CollabsPageProps {
  content?: SiteContent['collabs'];
  onNavigate: (page: NavPage) => void;
  onApplyPromoAndCheckout?: (code: string) => void;
  onNotify?: (msg: string) => void;
}

const DEFAULT_COLLABS: SiteContent['collabs'] = {
  header: {
    badge: 'STRATEGIC PARTNERSHIPS',
    title: 'Our Collabs',
    description:
      "We teamed up with India's leading quick-commerce giants to solve the perennial campus dilemma: getting physical printed notes and formula sheets in 10 minutes flat."
  },
  blinkit: {
    partnerName: 'Blinkit',
    partnerBadge: 'OFFICIAL 10-MIN CAMPUS PRINT PARTNER',
    headline: 'Instant Physical Spiral Booklet Delivery',
    description:
      'Need physical handwritten notes to annotate before your end-term paper? Order Tribe verified formula booklets via Blinkit. Laser-printed on 90GSM smudge-proof paper with high-durability spiral coil.',
    promoCode: 'BLINKTRIBE',
    discountText:
      'Flat ₹100 OFF on orders above ₹299 + zero delivery fee within 5km of listed university campuses.',
    features: [
      'Available in Delhi NCR, Bengaluru, Pune, Hyderabad campuses',
      'Live tracking direct to your hostel block or university gate'
    ]
  },
  zepto: {
    partnerName: 'Zepto',
    partnerBadge: 'LATE-NIGHT EXAM SOS COLLABORATION',
    headline: 'Exam Night SOS Kit + Munchies',
    description:
      'Cramming at 2:00 AM before a 9:30 AM exam? Zepto campus hubs stock Tribe Quick Revision pocket cards bundled with stationery (highlighters, graph paper) and late-night focus essentials.',
    promoCode: 'ZEPTOTRIBE',
    discountText:
      '20% instant rebate on Tribe revision kits + complimentary coffee sachet on orders past midnight.',
    features: [
      'Operating 24/7 during end-term university examination weeks',
      'Pocket-sized laminated formula sheets for last-minute revision'
    ]
  },
  howItWorksTitle: 'How Campus Delivery Works',
  howItWorksSteps: [
    {
      step: '01',
      title: 'Select Your University Pack',
      description:
        'Choose digital access or tap "Request Physical Copy" inside any course page on our site.'
    },
    {
      step: '02',
      title: 'Open Blinkit or Zepto App',
      description:
        'Search "Techie Teacher Tribe" or enter voucher code BLINKTRIBE / ZEPTOTRIBE at checkout.'
    },
    {
      step: '03',
      title: 'Collect at Hostel Gate in 10m',
      description:
        'Your high-yield spiral booklet arrives packaged with transparent waterproof sleeve.'
    }
  ],
  marqueeItems: [
    'BLINKIT 10-MINUTES',
    'ZEPTO EXAM SOS',
    'PHYSICAL PRINTED NOTES',
    'HOSTEL GATE DELIVERY',
    'CAMPUS EXCLUSIVE OFFERS'
  ]
};

export const CollabsPage: React.FC<CollabsPageProps> = ({
  content = DEFAULT_COLLABS,
  onNavigate,
  onApplyPromoAndCheckout,
  onNotify
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    const ok = await copyTextSafely(code);
    if (ok) {
      setCopiedCode(code);
      onNotify?.(`Promo code ${code} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      onNotify?.(`Use promo code ${code} at checkout.`);
    }
  };

  return (
    <div className="w-full bg-black text-white select-none">
      {/* Header section */}
      <section className="border-b-2 border-white py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
            {content.header.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight uppercase mt-2">
            {content.header.title}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
            {content.header.description}
          </p>
        </div>
      </section>

      <MarqueeStrip items={content.marqueeItems} />

      {/* Main Collabs Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Card 1: Blinkit Partnership */}
          <div className="bg-zinc-950 border-4 border-white p-8 sm:p-10 shadow-[10px_10px_0px_0px_#ffffff] flex flex-col justify-between">
            <div>
              {/* Partner Logo Card in Monochrome */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-white gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white text-black font-heading font-black text-2xl flex items-center justify-center border-2 border-black font-mono-numbers shrink-0">
                    B!
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-black uppercase tracking-tight">
                      {content.blinkit.partnerName}
                    </h2>
                    <span className="text-xs font-mono-numbers text-zinc-400 uppercase">
                      CAMPUS PRINT PARTNER
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-white text-black text-[10px] sm:text-xs font-mono-numbers font-black px-2.5 py-1 uppercase inline-block">
                    {content.blinkit.partnerBadge}
                  </span>
                </div>
              </div>

              {/* Offer Details */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-heading font-black uppercase text-white">
                  {content.blinkit.headline}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {content.blinkit.description}
                </p>

                <div className="p-4 border-2 border-zinc-700 bg-black space-y-2 text-xs">
                  <div className="font-bold text-white uppercase font-mono-numbers flex items-center justify-between gap-2">
                    <span>STUDENT BENEFIT CODE:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(content.blinkit.promoCode)}
                      className="min-h-[44px] px-3 py-1.5 bg-white text-black hover:bg-zinc-300 transition-colors flex items-center gap-1.5 font-mono-numbers font-black"
                    >
                      {copiedCode === content.blinkit.promoCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{content.blinkit.promoCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-400">
                    {content.blinkit.discountText}
                  </p>
                </div>
              </div>
            </div>

            {/* Features list + Actions */}
            <div className="mt-8 pt-6 border-t border-zinc-800 space-y-5">
              <div className="space-y-2 text-xs font-mono-numbers text-zinc-400">
                {content.blinkit.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onApplyPromoAndCheckout
                      ? onApplyPromoAndCheckout(content.blinkit.promoCode)
                      : onNavigate('cart')
                  }
                  className="min-h-[44px] flex-1 px-4 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-2 border-white"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Apply Code in Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="min-h-[44px] px-4 py-2.5 border-2 border-zinc-700 hover:border-white text-white font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Browse Courses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Zepto Partnership */}
          <div className="bg-zinc-950 border-4 border-white p-8 sm:p-10 shadow-[10px_10px_0px_0px_#ffffff] flex flex-col justify-between">
            <div>
              {/* Partner Logo Card in Monochrome */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-white gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white text-black font-heading font-black text-2xl flex items-center justify-center border-2 border-black font-mono-numbers shrink-0">
                    Z!
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-black uppercase tracking-tight">
                      {content.zepto.partnerName}
                    </h2>
                    <span className="text-xs font-mono-numbers text-zinc-400 uppercase">
                      LATE-NIGHT EXAM SOS COLLABORATION
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-white text-black text-[10px] sm:text-xs font-mono-numbers font-black px-2.5 py-1 uppercase inline-block">
                    {content.zepto.partnerBadge}
                  </span>
                </div>
              </div>

              {/* Offer Details */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-heading font-black uppercase text-white">
                  {content.zepto.headline}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {content.zepto.description}
                </p>

                <div className="p-4 border-2 border-zinc-700 bg-black space-y-2 text-xs">
                  <div className="font-bold text-white uppercase font-mono-numbers flex items-center justify-between gap-2">
                    <span>STUDENT BENEFIT CODE:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(content.zepto.promoCode)}
                      className="min-h-[44px] px-3 py-1.5 bg-white text-black hover:bg-zinc-300 transition-colors flex items-center gap-1.5 font-mono-numbers font-black"
                    >
                      {copiedCode === content.zepto.promoCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{content.zepto.promoCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-400">
                    {content.zepto.discountText}
                  </p>
                </div>
              </div>
            </div>

            {/* Features list + Actions */}
            <div className="mt-8 pt-6 border-t border-zinc-800 space-y-5">
              <div className="space-y-2 text-xs font-mono-numbers text-zinc-400">
                {content.zepto.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onApplyPromoAndCheckout
                      ? onApplyPromoAndCheckout(content.zepto.promoCode)
                      : onNavigate('cart')
                  }
                  className="min-h-[44px] flex-1 px-4 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-2 border-white"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Apply Code in Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('quick-learning')}
                  className="min-h-[44px] px-4 py-2.5 border-2 border-zinc-700 hover:border-white text-white font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Fast-Track Sprints</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Step Strip */}
        <div className="mt-20 border-t-2 border-white pt-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
              FULFILLMENT PROTOCOL
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
              {content.howItWorksTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.howItWorksSteps.map((st, idx) => (
              <div key={idx} className="p-6 border-2 border-white bg-black">
                <div className="text-2xl font-black font-mono-numbers text-white mb-2">{st.step}</div>
                <h4 className="font-bold uppercase text-sm">{st.title}</h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {st.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slogan Banner */}
      <SloganBanner
        variant="standard"
        slogan="Learn Smart. Learn Fast."
        subtext="From your screen to your desk in 10 minutes. The future of university prep is here."
      />
    </div>
  );
};
