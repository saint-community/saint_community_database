import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI, setAuthToken, setSanctumToken } from '../api';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await authAPI.login({ email, password });

            if (response && (response.token || response.access_token)) {
                setAuthToken(response.token || response.access_token);
                if (response.sanctum_token) {
                    setSanctumToken(response.sanctum_token);
                }
                onLoginSuccess();
            } else if (response && response.data && (response.data.token || response.data.access_token)) {
                // Handle case where token might be nested in data property which is common standard
                setAuthToken(response.data.token || response.data.access_token);
                if (response.data.sanctum_token || response.sanctum_token) {
                    setSanctumToken(response.data.sanctum_token || response.sanctum_token);
                }
                onLoginSuccess();
            } else {
                setError('Login successful but no token received. Please contact support.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-[#CCA856]/5 rounded-full blur-3xl"></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-[#1A1C1E]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[5%] left-[15%] w-[30%] h-[30%] bg-[#CCA856]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8 z-10 relative animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#1A1C1E] rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 hover:rotate-0 transition-all duration-500">
                        <span className="text-[#CCA856] font-black text-2xl tracking-tighter">SC</span>
                    </div>
                    <h1 className="text-2xl font-black text-[#1A1C1E] tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Admin Portal Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                        <div className="mt-0.5 text-red-500"><Lock size={14} /></div>
                        <p className="text-xs font-semibold text-red-600 leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CCA856] transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-[#F8F9FA] border border-slate-200 rounded-xl focus:outline-none focus:border-[#CCA856] focus:bg-white transition-all font-semibold text-sm text-[#1A1C1E] placeholder:text-slate-300"
                                placeholder="admin@saintscommunity.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CCA856] transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-11 py-3.5 bg-[#F8F9FA] border border-slate-200 rounded-xl focus:outline-none focus:border-[#CCA856] focus:bg-white transition-all font-semibold text-sm text-[#1A1C1E] placeholder:text-slate-300"
                                placeholder="••••••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A1C1E] transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#1A1C1E] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#2D3E50] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In to Dashboard
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Protected by SC Admin System v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
