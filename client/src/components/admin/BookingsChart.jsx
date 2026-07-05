import React, { useState } from 'react';

const BookingsChart = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState(null);

  const padding = 40;
  const chartHeight = 240;
  const chartWidth = 500;
  const containerHeight = chartHeight + padding * 2;
  const containerWidth = chartWidth + padding * 2;

  // Find max value to scale chart
  const maxVal = Math.max(...data.map(d => d.bookings)) * 1.1;

  const barWidth = 24;
  const gap = 34; // Gap between month columns

  return (
    <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-black">Booking Volume</h4>
          <p className="text-xs text-neutral-400">Monthly breakdown of successful bookings</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <span className="w-3 h-3 bg-black rounded-xs"></span>
          <span>Bookings Count</span>
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
                  {val}
                </text>
              </g>
            );
          })}

          {/* Month Columns */}
          {data.map((item, idx) => {
            // Group position
            const xGroup = padding + idx * (barWidth + gap) + 30;

            // Height scaling
            const hBookings = (item.bookings / maxVal) * chartHeight;

            // Y coordinate
            const yBookings = chartHeight - hBookings + padding;

            const isHovered = activeIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                className="cursor-pointer"
              >
                {/* Bookings Bar (Black) */}
                <rect
                  x={xGroup}
                  y={yBookings}
                  width={barWidth}
                  height={hBookings}
                  fill={isHovered ? '#404040' : '#111111'}
                  rx="3"
                  className="transition-all duration-300"
                />

                {/* Month label */}
                <text
                  x={xGroup + barWidth / 2}
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
                      x={xGroup - 28}
                      y={yBookings - 38}
                      width="80"
                      height="28"
                      fill="black"
                      rx="4"
                    />
                    <text
                      x={xGroup + 12}
                      y={yBookings - 20}
                      fill="white"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {item.bookings} bookings
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

export default BookingsChart;
