import { useState } from 'react';

const COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

const getLevel = (count) => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const ContributionGraph = ({ data, loading }) => {
  const [tooltip, setTooltip] = useState(null);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-40 h-5 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-[3px]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-[11px] h-[11px] rounded-[2px] bg-gray-800 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.weeks) return null;

  const weeks = data.weeks.slice(-20);

  // Get month labels
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ index: wi, label: MONTHS[month] });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {data.totalContributions} contributions
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>Less</span>
          {COLORS.map((c, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex ml-8 mb-1">
        {weeks.map((_, wi) => {
          const label = monthLabels.find((m) => m.index === wi);
          return (
            <div key={wi} className="w-[11px] mx-[1.5px] text-[9px] text-gray-500 text-center">
              {label ? label.label : ''}
            </div>
          );
        })}
      </div>

      {/* Graph grid */}
      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2 shrink-0">
          {DAYS.map((d, i) => (
            <div key={i} className="h-[11px] text-[9px] text-gray-500 leading-[11px]">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="flex gap-[3px] overflow-x-auto relative">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.contributionDays.map((day, di) => (
                <div
                  key={di}
                  className="w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-transform hover:scale-150 hover:z-10 relative"
                  style={{ backgroundColor: COLORS[getLevel(day.contributionCount)] }}
                  onMouseEnter={() => setTooltip({ x: wi, y: di, ...day })}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <div className="fixed-tooltip pointer-events-none absolute z-50 bg-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap -top-8"
              style={{ left: `${tooltip.x * 14}px` }}
            >
              {tooltip.contributionCount} contributions on{' '}
              {new Date(tooltip.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
