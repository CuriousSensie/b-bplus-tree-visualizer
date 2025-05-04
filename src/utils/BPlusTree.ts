export interface BPlusTreeNode {
  keys: number[];
  children: BPlusTreeNode[];
  next: BPlusTreeNode | null;
  isLeaf: boolean;
  isHighlighted?: boolean;
}

export class BPlusTree {
  root: BPlusTreeNode | null;
  order: number;
  minKeys: number;
  
  constructor(order = 3) {
    this.root = null;
    this.order = order;
    this.minKeys = Math.floor(order / 2);
  }
  
  createNode(isLeaf = false): BPlusTreeNode {
    return {
      keys: [],
      children: [],
      next: null,
      isLeaf
    };
  }
  
  search(key: number): BPlusTreeNode | null {
    return this.searchNode(this.root, key);
  }
  
  searchNode(node: BPlusTreeNode | null, key: number): BPlusTreeNode | null {
    if (!node) return null;
    
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }
    
    if (node.isLeaf) {
      if (i < node.keys.length && key === node.keys[i]) {
        return node;
      }
      return null;
    }
    
    return this.searchNode(node.children[i], key);
  }
  
  insert(key: number): void {
    if (!this.root) {
      this.root = this.createNode(true);
      this.root.keys.push(key);
      return;
    }
    
    const result = this.insertInternal(this.root, key);
    if (result) {
      const newRoot = this.createNode(false);
      newRoot.keys = [result.key];
      newRoot.children = [this.root, result.right];
      this.root = newRoot;
    }
  }
  
  insertInternal(node: BPlusTreeNode, key: number): { key: number, right: BPlusTreeNode } | null {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }
    
    if (node.isLeaf) {
      // Insert key in leaf node
      node.keys.splice(i, 0, key);
      
      // Split if necessary
      if (node.keys.length >= this.order) {
        const splitIndex = Math.floor(this.order / 2);
        const newNode = this.createNode(true);
        
        // Move second half keys to new node
        newNode.keys = node.keys.splice(splitIndex);
        
        // Set up leaf node links
        newNode.next = node.next;
        node.next = newNode;
        
        return { key: newNode.keys[0], right: newNode };
      }
      
      return null;
    } else {
      // Recurse down to leaf level
      const result = this.insertInternal(node.children[i], key);
      
      if (result) {
        // Insert key in internal node
        node.keys.splice(i, 0, result.key);
        node.children.splice(i + 1, 0, result.right);
        
        // Split if necessary
        if (node.keys.length >= this.order) {
          const splitIndex = Math.floor(this.order / 2);
          const newNode = this.createNode(false);
          
          // Move keys and children to new node
          newNode.keys = node.keys.splice(splitIndex + 1);
          newNode.children = node.children.splice(splitIndex + 1);
          
          const upKey = node.keys.pop()!;
          
          return { key: upKey, right: newNode };
        }
      }
      
      return null;
    }
  }
  
  delete(key: number): void {
    if (!this.root) return;
    
    this.deleteInternal(this.root, key);
    
    // If root has only one child, make that child the new root
    if (!this.root.isLeaf && this.root.keys.length === 0) {
      this.root = this.root.children[0];
    }
  }
  
  deleteInternal(node: BPlusTreeNode, key: number): boolean {
    let keyIndex = node.keys.indexOf(key);
    
    if (node.isLeaf) {
      // Key not found
      if (keyIndex === -1) return false;
      
      // Remove the key
      node.keys.splice(keyIndex, 1);
      
      // Check if underflow occurred
      return node !== this.root && node.keys.length < this.minKeys;
    } else {
      let childIndex: number;
      
      // Find appropriate child to recurse into
      if (keyIndex === -1) {
        childIndex = this.findChildIndex(node, key);
      } else {
        // For internal nodes in B+ tree, delete from leaf and update key in internal node if needed
        childIndex = keyIndex + 1;
      }
      
      const underflow = this.deleteInternal(node.children[childIndex], key);
      
      // Update key in internal node
      if (keyIndex !== -1) {
        // Find the smallest key in the right subtree
        const smallestInRightSubtree = this.findSmallest(node.children[childIndex]);
        
        if (node.children[childIndex].isLeaf) {
          // If the right child is a leaf, update the key
          if (node.children[childIndex].keys.length > 0) {
            node.keys[keyIndex] = node.children[childIndex].keys[0];
          }
        } else {
          // Otherwise, use the smallest key in the right subtree
          node.keys[keyIndex] = smallestInRightSubtree;
        }
      }
      
      if (underflow) {
        return this.handleUnderflow(node, childIndex);
      }
      
      return false;
    }
  }
  
  findChildIndex(node: BPlusTreeNode, key: number): number {
    let i = 0;
    while (i < node.keys.length && key >= node.keys[i]) {
      i++;
    }
    return i;
  }
  
  findSmallest(node: BPlusTreeNode): number {
    while (!node.isLeaf) {
      node = node.children[0];
    }
    return node.keys[0];
  }
  
  handleUnderflow(parent: BPlusTreeNode, childIndex: number): boolean {
    const child = parent.children[childIndex];
    
    // Try borrowing from left sibling
    if (childIndex > 0) {
      const leftSibling = parent.children[childIndex - 1];
      
      if (leftSibling.keys.length > this.minKeys) {
        if (child.isLeaf) {
          // For leaf nodes
          const borrowedKey = leftSibling.keys.pop()!;
          child.keys.unshift(borrowedKey);
          
          // Update parent key
          parent.keys[childIndex - 1] = child.keys[0];
        } else {
          // For internal nodes
          const borrowedKey = leftSibling.keys.pop()!;
          const borrowedChild = leftSibling.children.pop()!;
          
          child.keys.unshift(parent.keys[childIndex - 1]);
          child.children.unshift(borrowedChild);
          
          parent.keys[childIndex - 1] = borrowedKey;
        }
        
        return false;
      }
    }
    
    // Try borrowing from right sibling
    if (childIndex < parent.children.length - 1) {
      const rightSibling = parent.children[childIndex + 1];
      
      if (rightSibling.keys.length > this.minKeys) {
        if (child.isLeaf) {
          // For leaf nodes
          const borrowedKey = rightSibling.keys.shift()!;
          child.keys.push(borrowedKey);
          
          // Update parent key
          parent.keys[childIndex] = rightSibling.keys[0];
        } else {
          // For internal nodes
          const borrowedKey = rightSibling.keys.shift()!;
          const borrowedChild = rightSibling.children.shift()!;
          
          child.keys.push(parent.keys[childIndex]);
          child.children.push(borrowedChild);
          
          parent.keys[childIndex] = borrowedKey;
        }
        
        return false;
      }
    }
    
    // Merge nodes if borrowing isn't possible
    if (childIndex > 0) {
      // Merge with left sibling
      const leftSibling = parent.children[childIndex - 1];
      this.mergeNodes(parent, childIndex - 1, leftSibling, child);
    } else {
      // Merge with right sibling
      const rightSibling = parent.children[childIndex + 1];
      this.mergeNodes(parent, childIndex, child, rightSibling);
    }
    
    return parent.keys.length < this.minKeys;
  }
  
  mergeNodes(parent: BPlusTreeNode, index: number, leftNode: BPlusTreeNode, rightNode: BPlusTreeNode): void {
    if (leftNode.isLeaf) {
      // For leaf nodes
      leftNode.keys = leftNode.keys.concat(rightNode.keys);
      leftNode.next = rightNode.next;
    } else {
      // For internal nodes
      leftNode.keys.push(parent.keys[index]);
      leftNode.keys = leftNode.keys.concat(rightNode.keys);
      leftNode.children = leftNode.children.concat(rightNode.children);
    }
    
    // Remove merged key and child from parent
    parent.keys.splice(index, 1);
    parent.children.splice(index + 1, 1);
  }
  
  traverseLeaves(): number[] {
    if (!this.root) return [];
    
    let node = this.root;
    while (!node.isLeaf) {
      node = node.children[0];
    }
    
    const result: number[] = [];
    while (node) {
      result.push(...node.keys);
      node = node.next;
    }
    
    return result;
  }
  
  getTreeData() {
    // Convert the B+ tree to a format suitable for visualization
    // Remove the 'next' pointers to prevent circular references
    const simplifyNode = (node: BPlusTreeNode | null): any => {
      if (!node) return null;
      return {
        keys: [...node.keys],
        children: node.children.map(child => simplifyNode(child)),
        isLeaf: node.isLeaf,
        isHighlighted: node.isHighlighted
      };
    };
    
    return simplifyNode(this.root);
  }
}
