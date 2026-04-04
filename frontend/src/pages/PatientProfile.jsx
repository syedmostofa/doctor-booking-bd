import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfileApi, changePasswordApi } from '../api/authApi';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';

export default function PatientProfile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileApi(form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      return toast.error('Passwords do not match.');
    }
    setChangingPw(true);
    try {
      await changePasswordApi(pwForm.current_password, pwForm.new_password);
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <User className="text-teal-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      {/* Profile info */}
      <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="01XXXXXXXXX"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="text-xs text-gray-400">
          Role: <span className="capitalize font-medium">{user?.role}</span> &middot; Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '\u2014'}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            value={pwForm.current_password}
            onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={pwForm.new_password}
            onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
            required
            minLength={6}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={pwForm.confirm_password}
            onChange={(e) => setPwForm((p) => ({ ...p, confirm_password: e.target.value }))}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={changingPw}
          className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {changingPw ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
