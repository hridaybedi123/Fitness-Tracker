// src/pages/SignUp.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const SignUp: React.FC<{ onSwitchToSignIn: () => void }> = ({ onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to create an account.');
      }
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
        <h3 className="text-xl font-orbitron text-center text-[var(--text-primary)]">Create Account</h3>
        {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md text-center text-sm">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
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
              placeholder="At least 6 characters"
              required
              className="mt-1 w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
            />
          </div>
           <div>
            <label className="text-sm text-[var(--text-secondary)]">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="Re-enter password"
              required
              className="mt-1 w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 bg-[var(--accent-primary)] rounded-md font-bold text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <button onClick={onSwitchToSignIn} className="font-bold text-[var(--accent-primary)] hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
