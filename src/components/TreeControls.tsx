
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Minus, FileText } from 'lucide-react';

interface TreeControlsProps {
  onInsert: (value: number) => void;
  onDelete: (value: number) => void;
  onSearch: (value: number) => void;
  onPrint: () => void;
  onTreeTypeChange: (type: 'btree' | 'bplustree') => void;
  onOrderChange: (order: number) => void;
  onReset: () => void;
  treeType: 'btree' | 'bplustree';
  order: number;
}

const TreeControls: React.FC<TreeControlsProps> = ({
  onInsert,
  onDelete,
  onSearch,
  onPrint,
  onTreeTypeChange,
  onOrderChange,
  onReset,
  treeType,
  order,
}) => {
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleValueSubmit = (action: 'insert' | 'delete' | 'search') => {
    const value = parseInt(inputValue, 10);
    
    if (isNaN(value)) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }
    
    switch (action) {
      case 'insert':
        onInsert(value);
        toast({
          title: 'Node inserted',
          description: `Value ${value} has been inserted into the tree`,
        });
        break;
      case 'delete':
        onDelete(value);
        toast({
          title: 'Node deleted',
          description: `Value ${value} has been deleted from the tree`,
        });
        break;
      case 'search':
        onSearch(value);
        break;
    }
    
    setInputValue('');
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations" className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="value-input" className="text-sm font-medium mb-1 block">
                Value
              </Label>
              <Input
                id="value-input"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a number"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => handleValueSubmit('insert')}
            >
              <Plus className="h-4 w-4" />
              Insert
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => handleValueSubmit('delete')}
            >
              <Minus className="h-4 w-4" />
              Delete
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => handleValueSubmit('search')}
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={onPrint}
            >
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tree Type</Label>
            <RadioGroup 
              defaultValue={treeType}
              onValueChange={(value) => onTreeTypeChange(value as 'btree' | 'bplustree')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="btree" id="btree" />
                <Label htmlFor="btree" className="cursor-pointer">B-Tree</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bplustree" id="bplustree" />
                <Label htmlFor="bplustree" className="cursor-pointer">B+ Tree</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Order (Min: 3, Max: 10)</Label>
              <span className="text-sm font-medium">{order}</span>
            </div>
            <Slider 
              min={3}
              max={10}
              step={1}
              value={[order]}
              onValueChange={(value) => onOrderChange(value[0])}
              className="w-full"
            />
          </div>
          
          <Button variant="secondary" onClick={onReset} className="w-full">
            Reset Tree
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreeControls;
