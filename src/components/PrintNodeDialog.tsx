
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PrintNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: number[];
  treeType: 'btree' | 'bplustree';
}

const PrintNodeDialog: React.FC<PrintNodeDialogProps> = ({
  open,
  onOpenChange,
  values,
  treeType,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tree Contents</DialogTitle>
          <DialogDescription>
            {treeType === 'btree' ? 'Inorder traversal' : 'Leaf nodes (left to right)'}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-slate-50 rounded-md font-mono text-sm">
          {values.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {values.map((value, index) => (
                <span key={index} className="px-2 py-1 bg-white border rounded-md">
                  {value}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">Tree is empty</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintNodeDialog;
