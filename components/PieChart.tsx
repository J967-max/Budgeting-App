import React, { useState } from 'react';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  if (totalValue === 0) {
    return <div className="text-center text-gray-500">No budget data to display.</div>;
  }

  const cx = 100;
  const cy = 100;
  const radius = 90;
  let startAngle = -90; // Start at the top

  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="transform -rotate-90">
        <g>
          {data.map((item, index) => {
            const angle = (item.value / totalValue) * 360;
            const endAngle = startAngle + angle;

            const startX = cx + radius * Math.cos((Math.PI * startAngle) / 180);
            const startY = cy + radius * Math.sin((Math.PI * startAngle) / 180);
            const endX = cx + radius * Math.cos((Math.PI * endAngle) / 180);
            const endY = cy + radius * Math.sin((Math.PI * endAngle) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${cx},${cy}`,
              `L ${startX},${startY}`,
              `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`,
              'Z',
            ].join(' ');

            const isHovered = activeIndex === index;
            const scale = isHovered ? 'scale(1.05)' : 'scale(1)';
            
            const currentAngle = startAngle;
            startAngle = endAngle;

            return (
              <path
                key={item.name}
                d={pathData}
                fill={item.color}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className="transition-transform duration-200"
                style={{ transformOrigin: 'center center', transform: scale }}
              />
            );
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-full p-4">
            {activeIndex !== null ? (
                <>
                    <p className="text-lg font-bold text-gray-800 truncate max-w-[120px]">{data[activeIndex].name}</p>
                    <p className="text-sm font-medium text-gray-600">{formatCurrency(data[activeIndex].value)}</p>
                </>
            ) : (
                <>
                    <p className="text-sm font-semibold text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(totalValue)}</p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PieChart;