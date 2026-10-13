// import React, { useState } from 'react';
// import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
// import { BrandLogo } from '../components/BrandLogo.tsx';
// import { useAuth } from '../context/AuthContext.tsx';

// interface AdminLoginPageProps {
//   onLoginSuccess: () => void;
//   onBackToStore: () => void;
// }

// export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
//   onLoginSuccess,
//   onBackToStore
// }) => {
//   const { login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const readJsonResponse = async (res: Response) => {
//     const text = await res.text();
//     if (!text) return {};

//     try {
//       return JSON.parse(text);
//     } catch {
//       throw new Error('Server response was invalid or empty.');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccessMessage('');
//     setIsSubmitting(true);

//     const res = await login(email.trim(), password);
//     setIsSubmitting(false);

//     if (res.success) {
//       onLoginSuccess();
//     } else {
//       setError(res.error || 'Invalid administrator credentials');
//     }
//   };

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DFD8] shadow-xl space-y-6">
//         {/* Brand header */}
//         <div className="text-center space-y-2">
//           <BrandLogo size="md" />
//           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1E7DA] text-[#856525] rounded-full text-[11px] font-semibold uppercase tracking-wider mt-2">
//             <Shield className="w-3.5 h-3.5" />
//             <span>Staff Administration</span>
//           </div>
//           <p className="text-xs text-[#786A5E] pt-1">
//             Sign in to manage products, update inventory, and process customer orders.
//           </p>
//         </div>

//         {/* Error / success message */}
//         {(error || successMessage) && (
//           <div className={`p-3.5 border text-xs rounded-xl text-center font-medium ${
//             error
//               ? 'bg-rose-50 border-rose-200 text-rose-700'
//               : 'bg-emerald-50 border-emerald-200 text-emerald-700'
//           }`}>
//             {error || successMessage}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4 text-xs">
//             {/* Email input */}
//             <div>
//               <label className="block font-medium text-[#1F1D1B] mb-1.5 uppercase tracking-wider text-[11px]">
//                 Admin Email
//               </label>
//               <div className="relative">
//                 <Mail className="w-4 h-4 text-[#9E8E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   placeholder="admin@arabiansaaj.com"
//                   className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
//                 />
//               </div>
//             </div>

//             {/* Password input */}
//             <div>
//               <label className="block font-medium text-[#1F1D1B] mb-1.5 uppercase tracking-wider text-[11px]">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="w-4 h-4 text-[#9E8E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E8E81] hover:text-[#1F1D1B]"
//                 >
//                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             {/* Submit button */}
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full py-3.5 bg-[#1F1D1B] hover:bg-[#38322C] text-[#FAF8F5] text-xs uppercase font-bold tracking-widest rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
//             >
//               {isSubmitting ? (
//                 <span>Authenticating...</span>
//               ) : (
//                 <>
//                   <span>Sign In to Dashboard</span>
//                   <ArrowRight className="w-4 h-4 text-[#C5A059]" />
//                 </>
//               )}
//             </button>

//             <div className="pt-2 border-t border-[#F5EFEB]" />
//           </form>

//         {/* Back to storefront */}
//         <div className="text-center pt-2">
//           <button
//             onClick={onBackToStore}
//             className="text-xs text-[#786A5E] hover:text-[#1F1D1B] transition-colors"
//           >
//             ← Return to Arabian Saaj Storefront
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
