import React from 'react';
import CountUp from './CountUp';

const StatsCard = ({ title, value, numericValue, prefix = '', suffix = '', icon: Icon, change, changeType }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded p-8 flex items-center justify-between shadow-xs hover:border-black transition-all group">
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest block leading-none">{title}</span>
        
        <h3 className="text-4xl font-black text-black tracking-tight mt-2 flex items-center">
          {numericValue !== undefined ? (
            <CountUp end={numericValue} prefix={prefix} suffix={suffix} />
          ) : (
            <span>{value}</span>
          )}
        </h3>

        {change && (
          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
              changeType === 'increase' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {changeType === 'increase' ? '↑' : '↓'} {change}
            </span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">vs last month</span>
          </div>
        )}
      </div>

      {Icon && (
        <div className="w-14 h-14 rounded bg-neutral-50 group-hover:bg-black group-hover:text-white flex items-center justify-center text-neutral-800 border border-neutral-100 group-hover:border-black transition-all duration-300">
          <Icon className="w-7 h-7" />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
