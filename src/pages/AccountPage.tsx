import React, { useEffect, useState } from 'react';
import { LogIn, UserPlus, Package, LogOut } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext.tsx';
import { Order } from '../types.ts';

export const AccountPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user, isLoading, login, signup, logout, getOrders } = useUserAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) getOrders().then(setOrders).catch(() => setError('Could not load your orders.'));
  }, [user]);

  const update = (field: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    const result = mode === 'login'
      ? await login(form.email.trim(), form.password)
      : await signup(form.name.trim(), form.phone.trim(), form.email.trim(), form.password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Something went wrong.');
      return;
    }
    if (mode === 'signup') {
      setMode('login');
      setMessage('Account created successfully. Please log in.');
      setForm(prev => ({ ...prev, password: '' }));
    }
  };

  if (isLoading) return <div className="max-w-3xl mx-auto py-20 text-center text-xs text-[#786A5E]">Checking account...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#E8DFD8] p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            {mode === 'login' ? <LogIn className="w-8 h-8 mx-auto text-[#B38838]" /> : <UserPlus className="w-8 h-8 mx-auto text-[#B38838]" />}
            <h1 className="font-serif text-2xl font-bold mt-3">{mode === 'login' ? 'Customer Login' : 'Create Your Account'}</h1>
            <p className="text-xs text-[#786A5E] mt-2">{mode === 'login' ? 'View your profile and orders.' : 'Your account will be saved securely as a user.'}</p>
          </div>
          {(error || message) && <div className={`rounded-lg p-3 text-xs mb-4 ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || message}</div>}
          <form onSubmit={submit} className="space-y-4 text-xs">
            {mode === 'signup' && <>
              <input required placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl" />
              <input required type="tel" placeholder="Phone number" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl" />
            </>}
            <input required type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl" />
            <input required minLength={6} type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl" />
            <button disabled={submitting} className="w-full py-3 bg-[#1F1D1B] text-white rounded-xl uppercase tracking-widest font-bold disabled:opacity-60">{submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}</button>
          </form>
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="w-full mt-4 text-xs text-[#786A5E]">{mode === 'login' ? 'Create a new account' : 'Already have an account? Log in'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><p className="text-xs uppercase tracking-widest text-[#B38838]">My Profile</p><h1 className="font-serif text-2xl font-bold mt-1">{user.name}</h1><p className="text-xs text-[#786A5E]">{user.email} {user.phone ? `• ${user.phone}` : ''}</p></div>
        <button onClick={() => { logout(); onNavigate('home'); }} className="inline-flex items-center gap-2 text-xs text-[#786A5E]"><LogOut className="w-4 h-4" /> Log out</button>
      </div>
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6">
        <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-4"><Package className="w-5 h-5 text-[#B38838]" /><h2 className="font-serif text-lg font-bold">My Orders ({orders.length})</h2></div>
        {orders.length === 0 ? <p className="text-xs text-[#786A5E] py-8 text-center">You have not placed any orders yet.</p> : <div className="divide-y divide-[#F0EAE1]">{orders.map(order => <div key={order._id} className="py-4 flex items-center justify-between gap-4 text-xs"><div><p className="font-bold">{order.orderId}</p><p className="text-[#786A5E]">{order.products.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="font-bold">৳{order.total.toLocaleString()}</p><p className="text-[#B38838]">{order.status}</p></div></div>)}</div>}
      </div>
    </div>
  );
};
