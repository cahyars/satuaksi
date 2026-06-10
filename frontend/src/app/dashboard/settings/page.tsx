'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getBackendAssetUrl } from '@/utils/backend';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Phone, 
  Upload, 
  Save,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserSettings() {
  const { user, updateProfile, changePassword, loading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Nama lengkap tidak boleh kosong.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('emergencyContact', emergencyContact);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const success = await updateProfile(formData);
    if (success) {
      toast.success('Pengaturan profil berhasil diperbarui.');
      setAvatarFile(null);
    } else {
      toast.error('Gagal memperbarui pengaturan profil.');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Semua kolom sandi wajib diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi sandi baru tidak cocok.');
      return;
    }

    setPasswordLoading(true);
    const success = await changePassword({ currentPassword, newPassword });
    setPasswordLoading(false);

    if (success) {
      toast.success('Kata sandi berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Sandi saat ini tidak valid.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block">SECURE CREDENTIALS</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Pengaturan Profil</h1>
        <p className="text-xs text-slate-600 mt-0.5">Kelola data informasi akun Anda dan konfigurasikan kontak darurat SOS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Photo Selector */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 text-center space-y-4 h-fit">
          <span className="text-xs font-bold text-slate-800 block">Foto Profil</span>
          <div className="relative h-28 w-28 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : user?.avatar ? (
              <img src={getBackendAssetUrl(user.avatar)} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
          </div>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 transition-all mx-auto cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Ganti Foto</span>
            </button>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="md:col-span-2 space-y-6">
          {/* General Metadata form */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-5">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <User className="h-4.5 w-4.5 text-cyan-600" />
              <span>Informasi Pengguna</span>
            </span>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Nomor Kontak SOS Darurat</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Contoh: +628..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4.5 w-4.5" />
                <span>Simpan Perubahan</span>
              </button>
            </form>
          </div>

          {/* Change Password form */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-5">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <Lock className="h-4.5 w-4.5 text-cyan-600" />
              <span>Ganti Kata Sandi</span>
            </span>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Kata Sandi Sekarang</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>Ubah Kata Sandi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
