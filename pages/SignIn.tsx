// src/pages/SignIn.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const SignIn: React.FC<{ onSwitchToSignUp: () => void }> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background-start)] to-[var(--background-end)] p-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <h2 className="text-3xl font-orbitron text-center text-white">
          <span className="text-[var(--accent-primary)]">NEON</span>FIT
        </h2>
        <h3 className="text-xl font-orbitron text-center text-[var(--text-primary)]">Sign In</h3>
        {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md text-center text-sm">{error}</p>}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)]">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@email.com"
              required
              className="mt-1 w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)]">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              className="mt-1 w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 bg-[var(--accent-primary)] rounded-md font-bold text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignUp} className="font-bold text-[var(--accent-primary)] hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
