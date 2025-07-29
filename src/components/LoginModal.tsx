import React, { useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, phantomLogin as apiPhantomLogin, googleAuthUrl } from '../utils/api';
import Cookies from 'js-cookie';
import { useUser } from "./UserContext";
import InterstatePopout from './InterstatePopout';
import InterstateButton from './InterstateButton';
import bs58 from 'bs58';
import { toast } from 'react-hot-toast';
import { useWallet } from "./useWallet";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  forceLogin?: boolean;
}

// Extend the Window interface to include the solana property
declare global {
  interface Window {
    solana?: any;
  }
}

export default function LoginModal({ open, onClose, forceLogin = false }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { refreshUser, user, loading: userLoading } = useUser();
  const [wiggle, setWiggle] = useState(false);
  const { connectors, connectWith, connecting } = useWallet();

  useEffect(() => {
    if (open) {
      setShow(true);
      // Check for token in cookies and refresh user if not already authenticated
      const token = Cookies.get('token');
      if (token && !user && !userLoading) {
        setLoading(true);
        refreshUser().then(() => {
          setLoading(false);
          // If user is now authenticated, close the modal
          if (user) {
            onClose();
          }
        }).catch(() => setLoading(false));
      }
    } else {
      const timeout = setTimeout(() => setShow(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!open && !show) return null;

  // Login handler
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { token } = await apiLogin(email, password);
      Cookies.set('token', token, { expires: 7, path: '/' });
      await refreshUser();
      setSuccess('Login successful!');

      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // Registration handler
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { user } = await apiRegister(email, username, password);
      if (user?.token) {
        Cookies.set('token', user.token, { expires: 7, path: '/' });
      }
      Cookies.set('username', username, { expires: 7, path: '/' });
      Cookies.set('email', email, { expires: 7, path: '/' });
      await refreshUser();
      setSuccess('Registration successful!');
      setTimeout(() => {
        setMode('login');
        setSuccess(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  // Google Login handler
  async function handleGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      window.location.href = googleAuthUrl;
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  // Phantom Wallet Login handler
  async function handlePhantomLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const provider = window.solana;
    if (!provider) {
      alert('Phantom not found');
      setLoading(false);
      return;
    }
    try {
      // Ensure connection
      if (!provider.isConnected) {
        await provider.connect();
      }
      const message = `Login to Interstate with nonce: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signed = await provider.signMessage(encodedMessage);
      const publicKey = signed.publicKey.toBase58 ? signed.publicKey.toBase58() : signed.publicKey.toString();
      const signature = bs58.encode(signed.signature);
      const { token } = await apiPhantomLogin(publicKey, signature, message);
      if (token) {
        Cookies.set('token', token, { expires: 7, path: '/' });
        await refreshUser();
        setSuccess('login successful!');
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 1200);
      } else {
        setError('Phantom login failed');
      }
    } catch (error: any) {
      if (error && error.code === 4001) {
        setError('You must approve the request in Phantom.');
      } else {
        setError(error?.message || 'Phantom login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  // Handler for MetaMask (or other EVM) wallet
  function handleEvmConnect(connector: any) {
    connectWith(connector);
  }

  // Handle close attempt
  const handleClose = () => {
    if (forceLogin) {
      setWiggle(true);
      toast.error('Please log-in to trade on Narrative.');
      setTimeout(() => setWiggle(false), 600);
      return;
    }
    onClose();
  };

  return (
    <InterstatePopout open={open} onClose={handleClose} align="center" className={`bg-neutral-900 rounded-xl shadow-2xl w-[350px] p-6 relative text-neutral-100${wiggle ? ' wiggle' : ''}`} disableClickOutside={forceLogin}>
      <button
        className="absolute top-3 right-3 text-neutral-400 hover:text-white text-xl"
        onClick={handleClose}
        type="button"
      >
        ×
      </button>
      {mode === 'login' ? (
        <>
          <div className="text-xl font-bold mb-4 text-center">Login</div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="block text-xs mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-3xl border border-neutral-700 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label className="block text-xs mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-3xl border border-neutral-700 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mb-2">
                <InterstateButton variant="secondary" size="sm" type="button" className="text-xs text-emerald-400 hover:underline bg-transparent border-none shadow-none px-0 py-0 h-auto">Forgot password?</InterstateButton>
              </div>
            </div>
            {error && <div className="text-xs text-red-400 mb-2 text-center">{error}</div>}
            {success && <div className="text-xs text-emerald-400 mb-2 text-center">{success}</div>}
            <InterstateButton type="submit" fullWidth loading={loading} className="mb-3">Login</InterstateButton>
          </form>
          <div className="text-center flex flex-row items-center w-full text-xs mt-3 text-neutral-400 gap-1 justify-center">
            Don't have an account?{' '}
            <button className="text-emerald-400 hover:underline bg-transparent border-none shadow-none px-0 py-0 h-auto" onClick={() => setMode('signup')}>Sign up</button>
          </div>
        </>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="text-xl font-bold mb-4 text-center">Sign Up</div>
          <div className="mb-3">
            <label className="block text-xs mb-1">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-3xl border border-neutral-700 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <label className="block text-xs mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-3xl border border-neutral-700 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label className="block text-xs mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-3xl border border-neutral-700 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-xs text-red-400 mb-2 text-center">{error}</div>}
          {success && <div className="text-xs text-emerald-400 mb-2 text-center">{success}</div>}
          <InterstateButton type="submit" fullWidth loading={loading} className="mb-3">Sign Up</InterstateButton>
          <div className="text-center text-xs mt-3 text-neutral-400">
            Already have an account?{' '}
            <button className="text-emerald-400 hover:underline bg-transparent border-none shadow-none px-0 py-0 h-auto" onClick={() => setMode('login')}>Login</button>
          </div>
          <div className="text-xs text-neutral-500 mt-4 text-center">
            By creating an account, you agree to Interstate's{' '}
            <a href="#" className="underline">Privacy Policy</a> and{' '}
            <a href="#" className="underline">Terms of Service</a>.
          </div>
        </form>
      )}
      <hr  className="mt-4 border-neutral-600"/>
      <div className="flex flex-col gap-2 mt-4">
        <InterstateButton
          type="button"
          fullWidth
          variant="secondary"
          className="mb-1"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="flex items-center justify-center gap-2 font-normal text-sm">
            <img src="https://img.icons8.com/color/512/google-logo.png" alt="Google" className="w-6 h-6" />
            Continue with Google
          </span>
        </InterstateButton>

        <InterstateButton
          type="button"
          fullWidth
          variant="secondary"
          onClick={handlePhantomLogin}
          disabled={loading}
        >
          <span className="flex items-center justify-center gap-2 font-normal text-sm">
            <img src="https://docs.phantom.com/~gitbook/image?url=https%3A%2F%2F187760183-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MVOiF6Zqit57q_hxJYp%252Ficon%252FU7kNZ4ygz4QW1rUwOuTT%252FWhite%2520Ghost_docs_nu.svg%3Falt%3Dmedia%26token%3D447b91f6-db6d-4791-902d-35d75c19c3d1&width=48&height=48&sign=23b24c2a&sv=2" alt="Phantom" className="w-6 h-6 rounded-[100px]" />
            Continue with crypto wallet
          </span>
        </InterstateButton>
      </div>
    </InterstatePopout>
  );
} 