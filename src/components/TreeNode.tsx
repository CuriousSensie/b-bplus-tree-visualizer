
import React from 'react';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  keys: number[];
  isLeaf?: boolean;
  isHighlighted?: boolean;
  isBPlus?: boolean;
  className?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keys,
  isLeaf = false,
  isHighlighted = false,
  isBPlus = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-2 rounded-lg border-2 min-w-20 transition-all duration-300',
        isHighlighted
          ? 'border-orange-400 bg-orange-50'
          : isBPlus
          ? isLeaf
            ? 'border-teal-500 bg-teal-50'
            : 'border-teal-400 bg-teal-50/70'
          : 'border-blue-500 bg-blue-50',
        className
      )}
    >
      <div className="flex gap-2 items-center justify-center">
        {keys.map((key, index) => (
          <React.Fragment key={`${key}-${index}`}>
            {index > 0 && <div className="w-0.5 h-8 bg-gray-200 mx-1"></div>}
            <div className="font-mono font-medium">{key}</div>
          </React.Fragment>
        ))}
        {keys.length === 0 && <div className="font-mono italic text-gray-400">Empty</div>}
      </div>
    </div>
  );
};

export default TreeNode;
