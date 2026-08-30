import React, { useState } from 'react';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetHostPropertiesQuery } from '../../store/api/propertyApi';
import {
  useGetPropertyCalendarQuery,
  useBlockDatesMutation,
  useUnblockDatesMutation,
  useAddIcalFeedMutation,
  useSyncIcalFeedsMutation,
} from '../../store/api/availabilityApi';
import { HiOutlineCalendar, HiOutlineTrash, HiOutlineRefresh, HiOutlineLink } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const REASONS = [
  { id: 'personal', label: 'Personal use' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'external_booking', label: 'Booked elsewhere' },
  { id: 'other', label: 'Other' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Calendar = () => {
  const { data: propData, isLoading: propLoading } = useGetHostPropertiesQuery();
  const properties = propData?.properties || [];

  const [activeId, setActiveId] = useState('');
  const selectedId = activeId || properties[0]?._id || '';

  const { data: calData, isLoading: calLoading } = useGetPropertyCalendarQuery(selectedId, { skip: !selectedId });
  const bookings = calData?.bookings || [];
  const blocks = calData?.blocks || [];

  const [blockDates, { isLoading: blocking }] = useBlockDatesMutation();
  const [unblockDates] = useUnblockDatesMutation();
  const [addIcalFeed, { isLoading: addingFeed }] = useAddIcalFeedMutation();
  const [syncIcalFeeds, { isLoading: syncing }] = useSyncIcalFeedsMutation();

  const [form, setForm] = useState({ startDate: '', endDate: '', reason: 'personal', note: '' });
  const [feed, setFeed] = useState({ label: '', url: '' });

  const activeProperty = properties.find(item => item._id === selectedId);

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!selectedId) return toast.error('Pick a property first');
    if (!form.startDate || !form.endDate) return toast.error('Both dates are required');

    try {
      const res = await blockDates({ propertyId: selectedId, ...form }).unwrap();
      toast.success(res.message || 'Dates blocked');
      setForm({ startDate: '', endDate: '', reason: 'personal', note: '' });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not block those dates');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await unblockDates(id).unwrap();
      toast.success('Dates released');
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not release those dates');
    }
  };

  const handleAddFeed = async (e) => {
    e.preventDefault();
    if (!feed.url) return toast.error('Feed URL is required');
    try {
      await addIcalFeed({ propertyId: selectedId, ...feed }).unwrap();
      toast.success('Calendar feed added');
      setFeed({ label: '', url: '' });
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not add that feed');
    }
  };

  const handleSync = async () => {
    try {
      const res = await syncIcalFeeds(selectedId).unwrap();
      const imported = (res.results || []).reduce((sum, item) => sum + (item.imported || 0), 0);
      toast.success(`Synced. ${imported} date range(s) imported.`);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Sync failed');
    }
  };

  const formatRange = (from, to) =>
    `${new Date(from).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} → ${new Date(to).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const inputClass = "w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2.5 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]";
  const labelClass = "block font-black uppercase text-[10px] text-neutral-600 tracking-wider";

  return (
    <div className="space-y-6 text-black">
      <div className="border-b border-neutral-200 pb-4">
        <AdminCommonHead name="Calendar" des="Block dates, review what is booked, and keep other channels in sync" />
      </div>

      {/* Property picker */}
      <div className="bg-white border border-neutral-200 rounded p-5 shadow-xs space-y-2">
        <label className={labelClass}>Property</label>
        {propLoading ? (
          <p className="text-[13px] text-neutral-400 font-semibold">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="text-[13px] text-neutral-400 font-semibold">You have no listings yet.</p>
        ) : (
          <select value={selectedId} onChange={(e) => setActiveId(e.target.value)} className={inputClass}>
            {properties.map(item => (
              <option key={item._id} value={item._id}>{item.title}</option>
            ))}
          </select>
        )}
      </div>

      {selectedId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ====== Block dates ====== */}
          <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-5">
            <h3 className="font-black uppercase text-xs tracking-wider">Block dates</h3>

            <form onSubmit={handleBlock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>From</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>To</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Reason</label>
                <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputClass}>
                  {REASONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Note</label>
                <input type="text" placeholder="Optional" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" disabled={blocking}
                className="w-full bg-black hover:bg-neutral-800 text-white rounded py-3 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer disabled:opacity-50">
                {blocking ? 'Blocking...' : 'Block these dates'}
              </button>
            </form>
          </div>

          {/* ====== Channel sync ====== */}
          <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-5">
            <h3 className="font-black uppercase text-xs tracking-wider">Channel sync</h3>

            <div className="space-y-2">
              <label className={labelClass}>Your calendar feed</label>
              <div className="flex gap-2">
                <input readOnly value={`${API_BASE}/availability/ical/${selectedId}.ics`} className={`${inputClass} text-[11px] text-neutral-500`} />
                <button
                  onClick={() => { navigator.clipboard.writeText(`${API_BASE}/availability/ical/${selectedId}.ics`); toast.success('Link copied'); }}
                  className="px-4 border border-neutral-300 rounded font-black uppercase text-[10px] tracking-wider hover:bg-neutral-50 cursor-pointer whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 font-semibold">Paste this into Airbnb or Vrbo so they see your bookings here.</p>
            </div>

            <form onSubmit={handleAddFeed} className="space-y-3 pt-2 border-t border-neutral-100">
              <label className={labelClass}>Import a calendar</label>
              <input type="text" placeholder="Label, e.g. Airbnb" value={feed.label} onChange={(e) => setFeed({ ...feed, label: e.target.value })} className={inputClass} />
              <input type="url" placeholder="https://..." value={feed.url} onChange={(e) => setFeed({ ...feed, url: e.target.value })} className={inputClass} />
              <div className="flex gap-2">
                <button type="submit" disabled={addingFeed}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 rounded py-2.5 font-black uppercase text-[10px] tracking-wider hover:bg-neutral-50 cursor-pointer disabled:opacity-50">
                  <HiOutlineLink className="w-4 h-4" /> Add feed
                </button>
                <button type="button" onClick={handleSync} disabled={syncing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white rounded py-2.5 font-black uppercase text-[10px] tracking-wider hover:bg-neutral-800 cursor-pointer disabled:opacity-50">
                  <HiOutlineRefresh className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Sync now
                </button>
              </div>
            </form>

            {activeProperty?.icalUrls?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                {activeProperty.icalUrls.map((item, index) => (
                  <div key={index} className="flex justify-between text-[11px] font-semibold">
                    <span className="text-neutral-700">{item.label || 'Feed'}</span>
                    <span className="text-neutral-400">
                      {item.lastSyncedAt ? `synced ${new Date(item.lastSyncedAt).toLocaleDateString()}` : 'never synced'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== What is on the calendar ====== */}
      {selectedId && (
        <div className="bg-white border border-neutral-200 rounded shadow-xs">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
            <HiOutlineCalendar className="w-4 h-4 text-neutral-500" />
            <h3 className="font-black uppercase text-xs tracking-wider">Upcoming</h3>
          </div>

          {calLoading ? (
            <p className="p-6 text-[13px] text-neutral-400 font-semibold">Loading calendar...</p>
          ) : bookings.length === 0 && blocks.length === 0 ? (
            <p className="p-6 text-[13px] text-neutral-400 font-semibold">Nothing on the calendar yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {bookings.map((item, index) => (
                <div key={`b-${index}`} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-black uppercase text-[9px] tracking-wider">
                      {item.rentalType === 'mid' ? 'Monthly' : 'Nightly'}
                    </span>
                    <span className="text-[13px] font-semibold">{formatRange(item.checkInDate, item.checkOutDate)}</span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">{item.bookingStatus}</span>
                </div>
              ))}

              {blocks.map((item) => (
                <div key={item._id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 font-black uppercase text-[9px] tracking-wider">
                      Blocked
                    </span>
                    <span className="text-[13px] font-semibold">{formatRange(item.startDate, item.endDate)}</span>
                    {item.note && <span className="text-[11px] text-neutral-400 font-semibold">{item.note}</span>}
                  </div>
                  <button onClick={() => handleUnblock(item._id)}
                    className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 cursor-pointer">
                    <HiOutlineTrash className="w-3.5 h-3.5" /> Release
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
