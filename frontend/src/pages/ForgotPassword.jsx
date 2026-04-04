import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api/authApi';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Link to="/login" className="flex items-center gap-1 text-sm text-teal-600 mb-6 hover:underline">
        <ArrowLeft size={14} /> Back to Login
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
      <p className="text-gray-500 text-sm mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {sent ? (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center">
          <Mail size={40} className="mx-auto mb-3 text-teal-600" />
          <p className="text-teal-800 font-medium">Check your email</p>
          <p className="text-teal-600 text-sm mt-1">
            If an account with <strong>{email}</strong> exists, you'll receive a password reset link shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
}
