import React, { useState } from 'react';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import { useGetHostPropertiesQuery } from '../../store/api/propertyApi';
import {
  useGetPropertyRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} from '../../store/api/pricingRuleApi';
import { HiOutlineTrash, HiOutlineTag } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const WEEKDAYS = [
  { id: 0, short: 'Su' }, { id: 1, short: 'Mo' }, { id: 2, short: 'Tu' },
  { id: 3, short: 'We' }, { id: 4, short: 'Th' }, { id: 5, short: 'Fr' }, { id: 6, short: 'Sa' },
];

const emptyForm = {
  name: '', startDate: '', endDate: '', daysOfWeek: [],
  nightlyRate: '', monthlyRate: '', priority: 0,
};

const PricingRules = () => {
  const { data: propData, isLoading: propLoading } = useGetHostPropertiesQuery();
  const properties = propData?.properties || [];

  const [activeId, setActiveId] = useState('');
  const selectedId = activeId || properties[0]?._id || '';

  const { data: ruleData, isLoading: rulesLoading } = useGetPropertyRulesQuery(selectedId, { skip: !selectedId });
  const rules = ruleData?.rules || [];

  const [createRule, { isLoading: creating }] = useCreateRuleMutation();
  const [updateRule] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();

  const [form, setForm] = useState(emptyForm);

  const activeProperty = properties.find(item => item._id === selectedId);

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(item => item !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Give the rule a name');
    if (!form.nightlyRate && !form.monthlyRate) return toast.error('Set a nightly or monthly rate');

    try {
      await createRule({
        propertyId: selectedId,
        name: form.name,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        daysOfWeek: form.daysOfWeek,
        nightlyRate: form.nightlyRate ? Number(form.nightlyRate) : undefined,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
        priority: Number(form.priority) || 0,
      }).unwrap();
      toast.success('Pricing rule created');
      setForm(emptyForm);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not create that rule');
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await updateRule({ id: rule._id, ruleData: { isActive: !rule.isActive } }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not update that rule');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pricing rule?')) return;
    try {
      await deleteRule(id).unwrap();
      toast.success('Pricing rule deleted');
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not delete that rule');
    }
  };

  const describeWindow = (rule) => {
    const parts = [];
    if (rule.startDate && rule.endDate) {
      parts.push(`${new Date(rule.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} → ${new Date(rule.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`);
    }
    if (rule.daysOfWeek?.length) {
      parts.push(rule.daysOfWeek.map(day => WEEKDAYS[day].short).join(', '));
    }
    return parts.length ? parts.join(' · ') : 'Every day, all year';
  };

  const inputClass = "w-full bg-white border border-neutral-300 text-black font-semibold rounded px-3 py-2.5 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-[13px]";
  const labelClass = "block font-black uppercase text-[10px] text-neutral-600 tracking-wider";

  return (
    <div className="space-y-6 text-black">
      <div className="border-b border-neutral-200 pb-4">
        <AdminCommonHead name="Pricing Rules" des="Charge more at the weekend and in high season, less when it is quiet" />
      </div>

      <div className="bg-white border border-neutral-200 rounded p-5 shadow-xs space-y-2">
        <label className={labelClass}>Property</label>
        {propLoading ? (
          <p className="text-[13px] text-neutral-400 font-semibold">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="text-[13px] text-neutral-400 font-semibold">You have no listings yet.</p>
        ) : (
          <>
            <select value={selectedId} onChange={(e) => setActiveId(e.target.value)} className={inputClass}>
              {properties.map(item => <option key={item._id} value={item._id}>{item.title}</option>)}
            </select>
            {activeProperty && (
              <p className="text-[11px] text-neutral-400 font-semibold pt-1">
                Base rate ${activeProperty.pricePerNight}/night
                {activeProperty.monthlyRate ? ` · $${activeProperty.monthlyRate}/month` : ''}
              </p>
            )}
          </>
        )}
      </div>

      {selectedId && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ====== New rule ====== */}
          <form onSubmit={handleCreate} className="lg:col-span-2 bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-4 h-fit">
            <h3 className="font-black uppercase text-xs tracking-wider">New rule</h3>

            <div className="space-y-1.5">
              <label className={labelClass}>Name</label>
              <input type="text" placeholder="e.g. Weekend, New Year" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Season from</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Season to</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Days of week</label>
              <div className="flex gap-1.5">
                {WEEKDAYS.map(day => (
                  <button type="button" key={day.id} onClick={() => toggleDay(day.id)}
                    className={`flex-1 py-2 rounded border font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                      form.daysOfWeek.includes(day.id)
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400'
                    }`}>
                    {day.short}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-400 font-semibold">Leave all off to apply every day.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Nightly rate ($)</label>
                <input type="number" min="0" value={form.nightlyRate} onChange={(e) => setForm({ ...form, nightlyRate: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Monthly rate ($)</label>
                <input type="number" min="0" value={form.monthlyRate} onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Priority</label>
              <input type="number" min="0" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass} />
              <p className="text-[10px] text-neutral-400 font-semibold">Higher wins when two rules cover the same night.</p>
            </div>

            <button type="submit" disabled={creating}
              className="w-full bg-black hover:bg-neutral-800 text-white rounded py-3 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer disabled:opacity-50">
              {creating ? 'Creating...' : 'Create rule'}
            </button>
          </form>

          {/* ====== Existing rules ====== */}
          <div className="lg:col-span-3 bg-white border border-neutral-200 rounded shadow-xs">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
              <HiOutlineTag className="w-4 h-4 text-neutral-500" />
              <h3 className="font-black uppercase text-xs tracking-wider">Active rules</h3>
            </div>

            {rulesLoading ? (
              <p className="p-6 text-[13px] text-neutral-400 font-semibold">Loading rules...</p>
            ) : rules.length === 0 ? (
              <p className="p-6 text-[13px] text-neutral-400 font-semibold">No pricing rules yet. The base rate applies every night.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {rules.map(rule => (
                  <div key={rule._id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-[13px]">{rule.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-black uppercase text-[9px] tracking-wider">
                          P{rule.priority}
                        </span>
                        {!rule.isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-black uppercase text-[9px] tracking-wider">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-semibold">{describeWindow(rule)}</p>
                      <p className="text-[12px] font-black">
                        {rule.nightlyRate ? `$${rule.nightlyRate}/night` : ''}
                        {rule.nightlyRate && rule.monthlyRate ? '  ·  ' : ''}
                        {rule.monthlyRate ? `$${rule.monthlyRate}/month` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => handleToggleActive(rule)}
                        className="text-[10px] font-black uppercase tracking-wider text-neutral-500 hover:text-black cursor-pointer">
                        {rule.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => handleDelete(rule._id)}
                        className="text-red-500 hover:text-red-600 cursor-pointer">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRules;
