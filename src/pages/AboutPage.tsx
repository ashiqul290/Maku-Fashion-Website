import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Scissors } from 'lucide-react';

interface AboutPageProps {
  onExploreShop: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onExploreShop }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#B38838]">
          Our Heritage & Soul
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F1D1B]">
          The Story of Arabian Saaj
        </h1>
        <p className="text-sm text-[#786A5E] italic">
          “Elegance • Modesty • Style”
        </p>
      </div>

      {/* Main Narrative with Image */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#E8DFD8] shadow-xs">
        <div className="md:col-span-6 space-y-4 text-xs sm:text-sm text-[#5C5044] leading-relaxed">
          <h2 className="font-serif text-xl font-bold text-[#1F1D1B]">
            Born from a Passion for Dignified Beauty
          </h2>
          <p>
            <strong>Arabian Saaj</strong> was founded with a singular purpose: to curate modest wear that honors Islamic values without sacrificing contemporary sophistication, craftsmanship, or comfort.
          </p>
          <p>
            In a fashion world crowded with ephemeral trends and fleeting fads, we anchor our philosophy in timeless elegance. Every fabric—be it lightweight French chiffon, butter-soft Medina silk, or luxurious Dubai royal crepe—is personally touched and tested to ensure total opacity and breathable comfort under warm climates.
          </p>
          <p>
            We choose not to pigeonhole our modest creations into rigid, artificial categories. Modesty is not a checkbox; it is a way of life, an aura of quiet confidence that flows naturally from a soft daily hijab to an intricately beaded abaya for celebration.
          </p>
        </div>

        <div className="md:col-span-6 rounded-2xl overflow-hidden border border-[#E8DFD8] aspect-[4/5] bg-[#FAF6F0]">
          <img
            src="/uploads/cookware-02-red-ceramic-set.jpg"
            alt="Red ceramic cookware set"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* 4 Pillars of Arabian Saaj */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD8] space-y-2.5 text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E8DFD8] text-[#B38838] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[#1F1D1B]">100% Modest Cut</h3>
          <p className="text-xs text-[#786A5E] leading-relaxed">
            Generous silhouettes and full lengths carefully designed to flatter without clinging.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD8] space-y-2.5 text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E8DFD8] text-[#B38838] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[#1F1D1B]">Exquisite Fabrics</h3>
          <p className="text-xs text-[#786A5E] leading-relaxed">
            Premium Medina silk, Korean nidha, fine Turkish jersey, and airy chiffon handpicked for longevity.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD8] space-y-2.5 text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E8DFD8] text-[#B38838] flex items-center justify-center mx-auto shadow-xs">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[#1F1D1B]">Artisanal Precision</h3>
          <p className="text-xs text-[#786A5E] leading-relaxed">
            Hand-embellished zari, reinforced hems, and neat finishes that honor traditional craftsmanship.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD8] space-y-2.5 text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E8DFD8] text-[#B38838] flex items-center justify-center mx-auto shadow-xs">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[#1F1D1B]">Sisterhood Concierge</h3>
          <p className="text-xs text-[#786A5E] leading-relaxed">
            Dedicated styling advice and seamless size exchanges so you feel entirely confident.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <button
          onClick={onExploreShop}
          className="px-8 py-3.5 bg-[#1F1D1B] hover:bg-[#3D352D] text-[#FAF8F5] text-xs uppercase font-bold tracking-widest rounded-xl transition-all duration-300 shadow-md"
        >
          Explore All Products
        </button>
      </div>
    </div>
  );
};
