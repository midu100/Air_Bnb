import React from 'react';
import { HiOutlineArrowUp, HiOutlineArrowDown } from 'react-icons/hi';
import RevenueChart from '../../components/admin/RevenueChart';
import { REVENUE_CHART_DATA } from '../../data/adminMockData';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Business Analytics</h2>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Review pageviews, listing performance metrics, and conversions</p>
      </div>

      {/* Analytics stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Total Pageviews</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-black tracking-tight">48,250</h3>
            <span className="text-green-600 font-bold text-xs flex items-center gap-0.5">
              <HiOutlineArrowUp className="w-3.5 h-3.5" />
              18.4%
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Page loads across all units listed</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Conversion Rate</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-black tracking-tight">3.24%</h3>
            <span className="text-green-600 font-bold text-xs flex items-center gap-0.5">
              <HiOutlineArrowUp className="w-3.5 h-3.5" />
              2.1%
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Views that convert to reservations</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Bounce Rate</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-black tracking-tight">41.8%</h3>
            <span className="text-red-500 font-bold text-xs flex items-center gap-0.5">
              <HiOutlineArrowDown className="w-3.5 h-3.5" />
              4.8%
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium">Users leaving listing page immediately</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={REVENUE_CHART_DATA} />
        </div>
        
        {/* Performance ranking list */}
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider">Channels Traffic</h4>
            <p className="text-[10px] text-neutral-400 font-semibold mb-4">Traffic acquisition breakdown</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Direct Search</span>
                  <span>54%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded overflow-hidden">
                  <div className="bg-black h-full" style={{ width: '54%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Referrals (SEO)</span>
                  <span>28%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded overflow-hidden">
                  <div className="bg-neutral-600 h-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Social Channels</span>
                  <span>18%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded overflow-hidden">
                  <div className="bg-neutral-300 h-full" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-neutral-100 text-center">
            <button 
              onClick={() => toast.success('Analytics report exported successfully!')}
              className="text-xs font-bold uppercase tracking-wider border border-neutral-200 hover:bg-neutral-50 px-4 py-2 w-full rounded cursor-pointer transition-colors"
            >
              Export PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
