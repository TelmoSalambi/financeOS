import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const Login = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(true);
  const [registerStep, setRegisterStep] = useState(1); 
  const [accountType, setAccountType] = useState('personal'); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    companyName: ''
  });

  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Direct redirect for speed
      await signInWithGoogle();
    } catch (err) {
      if (isMounted.current) {
        setError('Falha ao iniciar login com Google. Tente novamente.');
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    if (isRegister && form.password !== form.confirmPassword) {
      setError('As palavras-passe não coincidem.');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isRegister) {
        result = await signUp(form.email, form.password, form.fullName, accountType, form.companyName);
        if (!result.error && result.data?.user) {
          if (isMounted.current) {
            setSuccess(true);
            setLoading(false);
          }
          return;
        }
      } else {
        result = await signIn(form.email, form.password);
      }

      if (result?.error && isMounted.current) {
        const errorCode = result.error.status;
        const errorMsg = result.error.message;

        if (errorCode === 429) {
          setError('Muitas tentativas seguidas. Aguarde 2 minutos.');
        } else if (errorMsg.includes('Invalid login credentials')) {
          setError('Email ou palavra-passe incorretos.');
        } else if (errorMsg.includes('Email not confirmed')) {
          setError('Por favor, confirme o seu e-mail na sua caixa de entrada.');
        } else {
          setError(errorMsg || 'Erro inesperado. Tente novamente.');
        }
      }
    } catch (err) {
      if (isMounted.current) setError('Erro de conexão. Verifique a internet.');
    } finally {
      if (isMounted.current && !success) setLoading(false);
    }
  };

  const selectType = (type) => {
    setAccountType(type);
    setRegisterStep(2);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 notranslate">
        <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-secondary mb-4">Conta Criada!</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Enviámos um link de confirmação para <span className="text-secondary font-bold">{form.email}</span>. 
            Por favor, verifique a sua caixa de entrada (e o spam) para ativar a sua conta.
          </p>
          <button 
            onClick={() => { setSuccess(false); setIsRegister(false); }}
            className="w-full py-4 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/30 notranslate">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FinanceOS</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Inteligência Financeira B2B2C</p>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Gestão profissional <span className="text-primary">unificada</span>.
          </h2>
          <p className="text-slate-400 mt-8 text-xl leading-relaxed font-medium">
            Seja para as suas finanças pessoais ou para gerir múltiplos clientes, oferecemos a ferramenta definitiva de sucesso financeiro.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-8">
          <p className="text-slate-500 text-xs font-medium">
            © 2026 FinanceOS. O seu futuro financeiro começa aqui.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/30">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
          
          {isRegister && registerStep === 2 && (
            <button 
              onClick={() => setRegisterStep(1)}
              className="absolute left-8 top-8 p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-4xl font-black text-secondary tracking-tight">
              {isRegister ? (registerStep === 1 ? 'Bem-vindo' : 'Dados da Conta') : 'Aceder'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              {isRegister 
                ? (registerStep === 1 ? 'Como pretende utilizar a plataforma?' : 'Complete o seu registo profissional.')
                : 'Introduza os seus dados para ver o seu dashboard.'}
            </p>
          </div>

          {isRegister && registerStep === 1 ? (
            <div key="welcome-step" className="space-y-4">
              <button 
                onClick={() => selectType('personal')}
                className="w-full p-6 border-2 border-slate-100 rounded-3xl flex items-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group text-left"
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <User size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg">Uso Pessoal</h4>
                  <p className="text-xs text-slate-400 font-medium">Giro as minhas próprias finanças e objetivos.</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-primary transition-colors" />
              </button>

              <button 
                onClick={() => selectType('business')}
                className="w-full p-6 border-2 border-slate-100 rounded-3xl flex items-center gap-4 hover:border-secondary hover:bg-secondary/5 transition-all group text-left"
              >
                <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg">Uso Profissional</h4>
                  <p className="text-xs text-slate-400 font-medium">Contabilista ou empresa gerindo vários clientes.</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-secondary transition-colors" />
              </button>

              <p className="text-center text-sm text-slate-500 mt-8">
                Já tem uma conta?{' '}
                <button
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className="text-primary font-bold hover:underline"
                >
                  Entrar aqui
                </button>
              </p>
            </div>
          ) : (
            <div key="auth-form" className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-secondary text-sm mb-6 active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continuar com o Google
              </button>

              <div className="relative flex items-center justify-center mb-8">
                <div className="w-full border-t border-slate-100"></div>
                <span className="absolute bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ou Credenciais</span>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl text-xs font-bold animate-in shake bg-negative/10 text-negative border border-negative/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text" name="fullName" value={form.fullName} onChange={handleChange}
                          placeholder="Ex: Helder Silva" required
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    {accountType === 'business' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa / Escritório</label>
                        <div className="relative group">
                          <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors" />
                          <input
                            type="text" name="companyName" value={form.companyName} onChange={handleChange}
                            placeholder="Ex: Contabilidade Global Lda" required
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-secondary/5 focus:border-secondary/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço de Email</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="helder@exemplo.com" required
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Palavra-passe</label>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={form.password} onChange={handleChange}
                      placeholder="••••••••" required minLength={6}
                      className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Palavra-passe</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                        placeholder="••••••••" required
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl disabled:opacity-70 mt-6 ${
                    accountType === 'business' && isRegister ? 'bg-secondary shadow-secondary/20 hover:bg-slate-800' : 'bg-primary shadow-primary/20 hover:bg-primary-dark'
                  }`}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {isRegister ? 'Finalizar Registo' : 'Entrar no Sistema'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-10">
                {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
                <button
                  onClick={() => { setIsRegister(!isRegister); setRegisterStep(1); setError(''); }}
                  className="text-primary font-bold hover:underline"
                >
                  {isRegister ? 'Entrar aqui' : 'Registar gratuitamente'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
