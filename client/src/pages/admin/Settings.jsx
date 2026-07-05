import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineKey, HiOutlineBell } from 'react-icons/hi';

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: 'Julietta Swan',
    email: 'Julietta@example.com',
    phone: '+1 (555) 019-2834',
    role: 'Super Admin'
  });

  const [password, setPassword] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert('Success: Profile configuration updated successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) {
      alert('Error: Confirm password does not match new password');
      return;
    }
    alert('Success: Authentication credentials updated successfully!');
    setPassword({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="space-y-6 text-xs text-black max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">Workspace Settings</h2>
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Configure admin profiles, access permissions and email alerts</p>
      </div>

      {/* Grid panels */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-neutral-100">
            <HiOutlineUser className="w-4 h-4 text-neutral-400" />
            <span>Administrator Profile</span>
          </h4>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-neutral-50 border border-neutral-200 text-neutral-400 rounded px-3 py-2 cursor-not-allowed font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">Phone Line</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">Access Permission Role</label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full bg-neutral-50 border border-neutral-200 text-neutral-400 rounded px-3 py-2 cursor-not-allowed font-semibold"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded font-bold cursor-pointer transition-all"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Security Password Card */}
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-neutral-100">
            <HiOutlineKey className="w-4 h-4 text-neutral-400" />
            <span>Update Password Credentials</span>
          </h4>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block font-bold uppercase text-[9px] text-neutral-500">Current Password</label>
              <input
                type="password"
                required
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">New Password</label>
                <input
                  type="password"
                  required
                  value={password.newPass}
                  onChange={(e) => setPassword({ ...password, newPass: e.target.value })}
                  className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold uppercase text-[9px] text-neutral-500">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  className="w-full bg-white border border-neutral-200 text-black rounded px-3 py-2 focus:outline-none focus:border-black font-semibold"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded font-bold cursor-pointer transition-all"
              >
                Save Credentials
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
