'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Trash2, 
  Edit, 
  Shield, 
  UserPlus, 
  X,
  Search,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import api from '@/services/api';
import { getBackendAssetUrl } from '@/utils/backend';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating a new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${searchQuery}`);
      setUsersList(res.data.users);
    } catch (err) {
      toast.error('Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Nama, email, dan sandi wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users', { name, email, password, phone, role });
      toast.success('Pengguna baru berhasil ditambahkan.');
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('USER');
      fetchUsers();
    } catch (err) {
      toast.error('Gagal menambahkan pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/${id}`, { isActive: !currentStatus });
      toast.success('Status keaktifan pengguna berhasil dirubah.');
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      toast.error('Gagal merubah status keaktifan pengguna.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Pengguna berhasil dihapus.');
      setUsersList(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      toast.error('Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest block">ADMIN ACCESS MANAGEMENT</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-600 mt-0.5">Kelola daftar akun warga, moderator, dan konfigurasi hak akses sistem.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-550 transition-all cursor-pointer shadow-md shadow-purple-500/10"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari pengguna berdasarkan nama atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-705 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="glass-panel border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Pengguna</th>
                <th className="p-4">Nomor Telepon</th>
                <th className="p-4">Hak Akses</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Memuat daftar akun pengguna...</td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada pengguna ditemukan.</td>
                </tr>
              ) : (
                usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {usr.avatar ? (
                            <img src={getBackendAssetUrl(usr.avatar)} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                          ) : (
                            usr.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{usr.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{usr.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{usr.phone || '-'}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        usr.role === 'ADMIN' 
                          ? 'bg-purple-50 text-purple-650 border-purple-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(usr.id, usr.isActive)}
                        className="flex items-center space-x-1.5 focus:outline-none"
                      >
                        {usr.isActive ? (
                          <ToggleRight className="h-5.5 w-5.5 text-cyan-600 cursor-pointer" />
                        ) : (
                          <ToggleLeft className="h-5.5 w-5.5 text-slate-400 cursor-pointer" />
                        )}
                        <span className="text-[10px] font-semibold text-slate-600">
                          {usr.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                        title="Hapus Akun secara Permanen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Dialog Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden z-10 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <Shield className="h-4.5 w-4.5 text-purple-600" />
                  <span>Tambah Pengguna Baru</span>
                </span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    placeholder="Budi Setiawan"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    placeholder="budi@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    placeholder="+62..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Hak Akses Sistem</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="USER">USER / Warga Umum</option>
                    <option value="ADMIN">ADMIN / Penyelamat utama</option>
                    <option value="MODERATOR">MODERATOR / Satgas</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-550 transition-all cursor-pointer"
                >
                  {submitting ? 'Memproses pendaftaran...' : 'Tambah Pengguna'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
