
import React, { useEffect, useRef } from 'react';
import TreeNode from './TreeNode';

interface TreeNodeData {
  keys: number[];
  children?: TreeNodeData[];
  isLeaf?: boolean;
  isHighlighted?: boolean;
}

interface TreeVisualizationProps {
  rootNode: TreeNodeData | null;
  isBPlus?: boolean;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ rootNode, isBPlus = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw connecting lines between nodes
  useEffect(() => {
    const drawLines = () => {
      if (!containerRef.current) return;
      
      // Clear existing lines
      const existingLines = containerRef.current.querySelectorAll('.tree-line');
      existingLines.forEach(line => line.remove());
      
      // Get all node elements
      const nodeElements = containerRef.current.querySelectorAll('.tree-node');
      
      // Process each level
      const levelMap = new Map<number, HTMLElement[]>();
      
      // Group nodes by their level
      nodeElements.forEach(node => {
        const level = parseInt(node.getAttribute('data-level') || '0');
        if (!levelMap.has(level)) {
          levelMap.set(level, []);
        }
        levelMap.get(level)?.push(node as HTMLElement);
      });
      
      // Draw lines from parent to children
      for (let level = 0; level < levelMap.size - 1; level++) {
        const parentNodes = levelMap.get(level) || [];
        const childNodes = levelMap.get(level + 1) || [];
        
        let childIndex = 0;
        parentNodes.forEach(parent => {
          const parentId = parent.getAttribute('data-node-id');
          const childCount = parseInt(parent.getAttribute('data-child-count') || '0');
          
          const parentRect = parent.getBoundingClientRect();
          const parentX = parentRect.left + parentRect.width / 2;
          const parentY = parentRect.bottom;
          
          for (let i = 0; i < childCount; i++) {
            if (childIndex < childNodes.length) {
              const child = childNodes[childIndex++];
              const childRect = child.getBoundingClientRect();
              const childX = childRect.left + childRect.width / 2;
              const childY = childRect.top;
              
              // Create SVG line
              const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              line.setAttribute('x1', (parentX - containerRef.current.getBoundingClientRect().left).toString());
              line.setAttribute('y1', (parentY - containerRef.current.getBoundingClientRect().top).toString());
              line.setAttribute('x2', (childX - containerRef.current.getBoundingClientRect().left).toString());
              line.setAttribute('y2', (childY - containerRef.current.getBoundingClientRect().top).toString());
              line.setAttribute('stroke', '#94a3b8'); // slate-400
              line.setAttribute('stroke-width', '1.5');
              line.classList.add('tree-line');
              
              // Add line to SVG
              const svg = containerRef.current.querySelector('svg');
              if (svg) {
                svg.appendChild(line);
              }
            }
          }
        });
      }
    };

    drawLines();
    
    // Redraw lines on window resize
    window.addEventListener('resize', drawLines);
    return () => window.removeEventListener('resize', drawLines);
  }, [rootNode]);

  const renderNode = (node: TreeNodeData, level: number, index: number, parentId: string): JSX.Element => {
    const nodeId = `${parentId}-${index}`;
    
    return (
      <div 
        key={nodeId} 
        className="flex flex-col items-center" 
        style={{ marginBottom: '40px' }}
      >
        <div 
          className="tree-node" 
          data-level={level} 
          data-node-id={nodeId}
          data-child-count={node.children?.length || 0}
        >
          <TreeNode 
            keys={node.keys} 
            isLeaf={node.isLeaf} 
            isHighlighted={node.isHighlighted}
            isBPlus={isBPlus}
          />
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="flex justify-center gap-4 mt-6">
            {node.children.map((child, childIndex) => renderNode(child, level + 1, childIndex, nodeId))}
          </div>
        )}
      </div>
    );
  };

  if (!rootNode) {
    return <div className="text-center text-gray-500 italic">Tree is empty</div>;
  }

  return (
    <div className="w-full overflow-x-auto py-8" ref={containerRef}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none"></svg>
      <div className="flex justify-center min-w-full">
        {renderNode(rootNode, 0, 0, 'root')}
      </div>
    </div>
  );
};

export default TreeVisualization;
