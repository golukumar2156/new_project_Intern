import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = '',
}) => {
  const isSorted = currentSortBy === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 cursor-pointer select-none hover:bg-slate-100 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-1.5">
        <span>{label}</span>
        <span className="text-slate-400">
          {!isSorted && <ArrowUpDown size={14} />}
          {isSorted && currentSortOrder === 'asc' && <ArrowUp size={14} className="text-blue-600 font-bold" />}
          {isSorted && currentSortOrder === 'desc' && <ArrowDown size={14} className="text-blue-600 font-bold" />}
        </span>
      </div>
    </th>
  );
};
