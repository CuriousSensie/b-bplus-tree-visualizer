
import React, { useState, useEffect } from 'react';
import TreeVisualization from '@/components/TreeVisualization';
import TreeControls from '@/components/TreeControls';
import PrintNodeDialog from '@/components/PrintNodeDialog';
import { BTree } from '@/utils/BTree';
import { BPlusTree } from '@/utils/BPlusTree';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [treeType, setTreeType] = useState<'btree' | 'bplustree'>('btree');
  const [order, setOrder] = useState(3);
  const [btree, setBtree] = useState(new BTree(order));
  const [bPlusTree, setBPlusTree] = useState(new BPlusTree(order));
  const [treeData, setTreeData] = useState<any>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printValues, setPrintValues] = useState<number[]>([]);
  
  const { toast } = useToast();
  
  useEffect(() => {
    updateTreeData();
  }, [btree, bPlusTree, treeType]);
  
  useEffect(() => {
    // Reset trees when order changes
    resetTrees();
  }, [order]);
  
  const updateTreeData = () => {
    if (treeType === 'btree') {
      setTreeData(btree.getTreeData());
    } else {
      setTreeData(bPlusTree.getTreeData());
    }
  };
  
  const handleInsert = (value: number) => {
    if (treeType === 'btree') {
      const newTree = new BTree(order);
      Object.assign(newTree, btree);
      newTree.insert(value);
      setBtree(newTree);
    } else {
      const newTree = new BPlusTree(order);
      Object.assign(newTree, bPlusTree);
      newTree.insert(value);
      setBPlusTree(newTree);
    }
  };
  
  const handleDelete = (value: number) => {
    if (treeType === 'btree') {
      const newTree = new BTree(order);
      Object.assign(newTree, btree);
      newTree.delete(value);
      setBtree(newTree);
    } else {
      const newTree = new BPlusTree(order);
      Object.assign(newTree, bPlusTree);
      newTree.delete(value);
      setBPlusTree(newTree);
    }
  };
  
  const handleSearch = (value: number) => {
    let result = null;
    
    if (treeType === 'btree') {
      result = btree.search(value);
    } else {
      result = bPlusTree.search(value);
    }
    
    if (result) {
      toast({
        title: 'Value found',
        description: `${value} is present in the tree`,
      });
    } else {
      toast({
        title: 'Value not found',
        description: `${value} is not present in the tree`,
        variant: 'destructive',
      });
    }
  };
  
  const handlePrint = () => {
    if (treeType === 'btree') {
      setPrintValues(btree.inOrderTraversal());
    } else {
      setPrintValues(bPlusTree.traverseLeaves());
    }
    setPrintDialogOpen(true);
  };
  
  const handleTreeTypeChange = (type: 'btree' | 'bplustree') => {
    setTreeType(type);
  };
  
  const handleOrderChange = (newOrder: number) => {
    setOrder(newOrder);
  };
  
  const resetTrees = () => {
    setBtree(new BTree(order));
    setBPlusTree(new BPlusTree(order));
    
    toast({
      title: 'Tree reset',
      description: `Created a new ${treeType === 'btree' ? 'B-Tree' : 'B+ Tree'} with order ${order}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {treeType === 'btree' ? 'B-Tree' : 'B+ Tree'} Visualization
          </h1>
          <p className="text-gray-600 mt-2">
            A visual explorer for understanding B-trees and B+ trees
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TreeControls
              onInsert={handleInsert}
              onDelete={handleDelete}
              onSearch={handleSearch}
              onPrint={handlePrint}
              onTreeTypeChange={handleTreeTypeChange}
              onOrderChange={handleOrderChange}
              onReset={resetTrees}
              treeType={treeType}
              order={order}
            />
          </div>
          
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden border">
            <div className="p-4 bg-gray-50 border-b text-sm text-gray-500">
              Tree visualization (order {order})
            </div>
            <div className="p-4 min-h-[500px] relative">
              <div className="h-full w-full relative">
                <TreeVisualization
                  rootNode={treeData}
                  isBPlus={treeType === 'bplustree'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <PrintNodeDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        values={printValues}
        treeType={treeType}
      />
    </div>
  );
};

export default Index;
