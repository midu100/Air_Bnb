import React, { useState } from 'react';

const RevenueChart = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState(null);

  const padding = 40;
  const chartHeight = 240;
  const chartWidth = 500;
  const containerHeight = chartHeight + padding * 2;
  const containerWidth = chartWidth + padding * 2;

  // Find max value to scale chart
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.costs, d.profit))) * 1.1;

  const barWidth = 14;
  const gap = 34; // Gap between month groups

  return (
    <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-black">Financial Performance</h4>
          <p className="text-xs text-neutral-400">Monthly breakdown of Revenue, Costs & Profit</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-black rounded-xs"></span>
            <span className="text-neutral-600">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-neutral-300 rounded-xs"></span>
            <span className="text-neutral-600">Costs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-neutral-600 rounded-xs"></span>
            <span className="text-neutral-600">Profit</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto no-scrollbar">
        <svg viewBox={`0 0 ${containerWidth} ${containerHeight}`} className="w-full min-w-[500px] h-[320px]">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = Math.round(maxVal * ratio);
            const y = chartHeight - (chartHeight * ratio) + padding;
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth + padding}
                  y2={y}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  fill="#888888"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  ${val}
                </text>
              </g>
            );
          })}

          {/* Month Columns */}
          {data.map((item, idx) => {
            // Group position
            const xGroup = padding + idx * (barWidth * 3 + gap) + 15;

            // Height scaling
            const hRev = (item.revenue / maxVal) * chartHeight;
            const hCost = (item.costs / maxVal) * chartHeight;
            const hProf = (item.profit / maxVal) * chartHeight;

            // Y coordinate
            const yRev = chartHeight - hRev + padding;
            const yCost = chartHeight - hCost + padding;
            const yProf = chartHeight - hProf + padding;

            const isHovered = activeIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                className="cursor-pointer"
              >
                {/* Revenue Bar (Black) */}
                <rect
                  x={xGroup}
                  y={yRev}
                  width={barWidth}
                  height={hRev}
                  fill={isHovered ? '#262626' : '#000000'}
                  rx="2"
                  className="transition-all duration-300"
                />

                {/* Costs Bar (Light Grey) */}
                <rect
                  x={xGroup + barWidth + 3}
                  y={yCost}
                  width={barWidth}
                  height={hCost}
                  fill={isHovered ? '#d4d4d4' : '#e5e5e5'}
                  rx="2"
                  className="transition-all duration-300"
                />

                {/* Profit Bar (Dark Grey) */}
                <rect
                  x={xGroup + (barWidth + 3) * 2}
                  y={yProf}
                  width={barWidth}
                  height={hProf}
                  fill={isHovered ? '#404040' : '#6b7280'}
                  rx="2"
                  className="transition-all duration-300"
                />

                {/* Month label */}
                <text
                  x={xGroup + barWidth * 1.5 + 3}
                  y={chartHeight + padding + 18}
                  fill="#444444"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {item.month}
                </text>

                {/* Tooltip Overlay */}
                {isHovered && (
                  <g>
                    <rect
                      x={xGroup - 35}
                      y={Math.min(yRev, yCost, yProf) - 55}
                      width="130"
                      height="48"
                      fill="black"
                      rx="4"
                    />
                    <text
                      x={xGroup + 30}
                      y={Math.min(yRev, yCost, yProf) - 39}
                      fill="white"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      Rev: ${item.revenue} | Cost: ${item.costs}
                    </text>
                    <text
                      x={xGroup + 30}
                      y={Math.min(yRev, yCost, yProf) - 24}
                      fill="#a3a3a3"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="semibold"
                      fontFamily="sans-serif"
                    >
                      Net Profit: ${item.profit}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RevenueChart;
