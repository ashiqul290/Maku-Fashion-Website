import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Message sent to Arabian Saaj concierge', 'We will contact you shortly.', 'success');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#B38838]">
          Concierge & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1F1D1B]">
          We Are Here for You
        </h1>
        <p className="text-xs sm:text-sm text-[#786A5E]">
          Have questions about an abaya length hijab fabric, or your recent order? Reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD8] shadow-xs space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#1F1D1B]">
              Direct Assistance
            </h3>

            <div className="space-y-4 text-xs">
              {/* WhatsApp */}
              <a
                href="https://wa.me/8801308253639"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3.5 p-3.5 bg-[#FAF8F5] hover:bg-[#F2ECE4] rounded-xl border border-[#E8DFD8] transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1F1D1B] group-hover:text-[#B38838] transition-colors">
                    WhatsApp Concierge
                  </h4>
                  <p className="text-[#786A5E] mt-0.5">01308-253639</p>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Typically replies in 10 mins
                  </span>
                </div>
              </a>

              {/* Phone */}
              <div className="flex items-start gap-3.5 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
                <div className="w-10 h-10 rounded-lg bg-[#F1E7DA] text-[#856525] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1F1D1B]">Helpline Hotline</h4>
                  <p className="text-[#786A5E] mt-0.5">01308-253639</p>
                  <span className="text-[10px] text-[#8C7C6E]">
                    Sat – Thu: 10:00 AM – 9:00 PM
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
                <div className="w-10 h-10 rounded-lg bg-[#F1E7DA] text-[#856525] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1F1D1B]">Email Address</h4>
                  <p className="text-[#786A5E] mt-0.5">support.shopping@gmail.com</p>
                  <span className="text-[10px] text-[#8C7C6E]">
                    For inquiries and corporate orders
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
                <div className="w-10 h-10 rounded-lg bg-[#F1E7DA] text-[#856525] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1F1D1B]">Dhaka Atelier & Studio</h4>
                  <p className="text-[#786A5E] mt-0.5">
                    Zigatola, Dhanmondhi, Dhaka-1209, Bangladesh
                  </p>
                  <p className="text-[10px] text-[#8C7C6E] flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Always Open</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD8] shadow-xs">
          <h3 className="font-serif text-lg font-bold text-[#1F1D1B] mb-1">
            Send an Inquiry
          </h3>
          <p className="text-xs text-[#786A5E] mb-6">
            Leave us your details and message, and our modest fashion consultants will get in touch with you.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] p-6">
              <CheckCircle2 className="w-12 h-12 text-[#B38838] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#1F1D1B]">
                Message Received!
              </h4>
              <p className="text-xs text-[#6B5E51] max-w-sm mx-auto">
                Thank you for contacting Arabian Saaj. Our team will contact you via phone or WhatsApp shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2 bg-[#1F1D1B] text-[#FAF8F5] text-xs uppercase tracking-wider rounded-lg"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ArabianSaaj"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="support.shopping@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[11px]">
                  Message or Inquiry <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Ask about product measurements, fabric recommendations, custom lengths, or order status..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#1F1D1B] hover:bg-[#3D352D] text-[#FAF8F5] text-xs uppercase font-bold tracking-widest rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4 text-[#C5A059]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
