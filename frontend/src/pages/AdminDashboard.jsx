import { useState, useEffect } from 'react';
import { getAdminStatsApi, getAdminUsersApi, updateUserRoleApi, deleteUserApi } from '../api/adminApi';
import toast from 'react-hot-toast';
import { Shield, Users, Calendar, Banknote, Trash2 } from 'lucide-react';

const TABS = ['overview', 'users'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (tab === 'overview') {
      setLoading(true);
      getAdminStatsApi()
        .then((res) => setStats(res.data.stats))
        .catch(() => toast.error('Failed to load stats.'))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
  }, [tab, userPagination.page, roleFilter]);

  const loadUsers = () => {
    setLoading(true);
    getAdminUsersApi({ page: userPagination.page, limit: 20, role: roleFilter || undefined, search: userSearch || undefined })
      .then((res) => {
        setUsers(res.data.users ?? []);
        setUserPagination((p) => ({ ...p, totalPages: res.data.pagination?.totalPages ?? 1 }));
      })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleApi(userId, newRole);
      toast.success('Role updated.');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await deleteUserApi(userId);
      toast.success('User deleted.');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-teal-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 max-w-xs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'overview' && stats ? (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.total_users} color="text-blue-600 bg-blue-50" />
            <StatCard icon={Users} label="Doctors" value={stats.total_doctors} color="text-teal-600 bg-teal-50" />
            <StatCard icon={Calendar} label="Appointments" value={stats.appointments.total} color="text-purple-600 bg-purple-50" />
            <StatCard icon={Banknote} label="Revenue" value={`৳${stats.total_revenue.toLocaleString()}`} color="text-green-600 bg-green-50" />
          </div>

          {/* Appointment breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Appointment Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(stats.appointments).filter(([k]) => k !== 'total').map(([status, count]) => (
                <div key={status} className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-xl font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-500 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === 'users' ? (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setUserPagination((p) => ({ ...p, page: 1 })); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Roles</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
            <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} className="flex gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name or email..."
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-56"
              />
              <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">
                Search
              </button>
            </form>
          </div>

          {/* Users table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {userPagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setUserPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={userPagination.page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {userPagination.page} / {userPagination.totalPages}
              </span>
              <button
                onClick={() => setUserPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={userPagination.page === userPagination.totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
