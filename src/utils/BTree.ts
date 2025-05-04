
export interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
  isLeaf: boolean;
  isHighlighted?: boolean;
}

export class BTree {
  root: BTreeNode | null;
  order: number;
  minKeys: number;
  
  constructor(order = 3) {
    this.root = null;
    this.order = order;
    this.minKeys = Math.floor((order - 1) / 2);
  }
  
  createNode(isLeaf = false): BTreeNode {
    return {
      keys: [],
      children: [],
      isLeaf,
    };
  }
  
  search(key: number): BTreeNode | null {
    return this.searchNode(this.root, key);
  }
  
  searchNode(node: BTreeNode | null, key: number): BTreeNode | null {
    if (!node) return null;
    
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }
    
    if (i < node.keys.length && key === node.keys[i]) {
      return node;
    }
    
    if (node.isLeaf) {
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
    
    if (this.root.keys.length === (2 * this.order - 1)) {
      const newRoot = this.createNode(false);
      newRoot.children.push(this.root);
      this.splitChild(newRoot, 0);
      this.root = newRoot;
      this.insertNonFull(this.root, key);
    } else {
      this.insertNonFull(this.root, key);
    }
  }
  
  insertNonFull(node: BTreeNode, key: number): void {
    let i = node.keys.length - 1;
    
    if (node.isLeaf) {
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      node.keys[i + 1] = key;
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      
      if (node.children[i].keys.length === (2 * this.order - 1)) {
        this.splitChild(node, i);
        if (key > node.keys[i]) {
          i++;
        }
      }
      
      this.insertNonFull(node.children[i], key);
    }
  }
  
  splitChild(parent: BTreeNode, index: number): void {
    const order = this.order;
    const child = parent.children[index];
    const newChild = this.createNode(child.isLeaf);
    
    parent.keys.splice(index, 0, child.keys[order - 1]);
    
    for (let j = 0; j < order - 1; j++) {
      newChild.keys.push(child.keys[j + order]);
    }
    
    if (!child.isLeaf) {
      for (let j = 0; j < order; j++) {
        newChild.children.push(child.children[j + order]);
      }
      child.children.splice(order, order);
    }
    
    child.keys.splice(order - 1, order);
    parent.children.splice(index + 1, 0, newChild);
  }
  
  delete(key: number): void {
    if (!this.root) return;
    
    this.deleteKey(this.root, key);
    
    if (this.root.keys.length === 0 && !this.root.isLeaf) {
      this.root = this.root.children[0];
    }
  }
  
  deleteKey(node: BTreeNode, key: number): void {
    let index = this.findKeyIndex(node, key);
    
    if (index < node.keys.length && node.keys[index] === key) {
      if (node.isLeaf) {
        // Case 1: If the key is in leaf node, simply remove it
        node.keys.splice(index, 1);
      } else {
        // Case 2: If the key is in an internal node
        const leftChild = node.children[index];
        const rightChild = node.children[index + 1];
        
        if (leftChild.keys.length >= this.order) {
          // Case 2a: If the left child has at least t keys
          const predecessor = this.getPredecessor(leftChild);
          node.keys[index] = predecessor;
          this.deleteKey(leftChild, predecessor);
        } else if (rightChild.keys.length >= this.order) {
          // Case 2b: If the right child has at least t keys
          const successor = this.getSuccessor(rightChild);
          node.keys[index] = successor;
          this.deleteKey(rightChild, successor);
        } else {
          // Case 2c: If both left and right children have t-1 keys
          this.mergeNodes(node, index);
          this.deleteKey(leftChild, key);
        }
      }
    } else {
      if (node.isLeaf) {
        return;
      }
      
      const isLastChild = index === node.keys.length;
      const childNode = node.children[index];
      
      if (childNode.keys.length < this.order) {
        this.fillChild(node, index);
      }
      
      if (isLastChild && index > node.keys.length) {
        this.deleteKey(node.children[index - 1], key);
      } else {
        this.deleteKey(node.children[index], key);
      }
    }
  }
  
  findKeyIndex(node: BTreeNode, key: number): number {
    let index = 0;
    while (index < node.keys.length && node.keys[index] < key) {
      index++;
    }
    return index;
  }
  
  getPredecessor(node: BTreeNode): number {
    while (!node.isLeaf) {
      node = node.children[node.children.length - 1];
    }
    return node.keys[node.keys.length - 1];
  }
  
  getSuccessor(node: BTreeNode): number {
    while (!node.isLeaf) {
      node = node.children[0];
    }
    return node.keys[0];
  }
  
  mergeNodes(parent: BTreeNode, index: number): void {
    const child = parent.children[index];
    const sibling = parent.children[index + 1];
    
    // Move key from parent to child
    child.keys.push(parent.keys[index]);
    
    // Move all keys from sibling to child
    for (const key of sibling.keys) {
      child.keys.push(key);
    }
    
    // If not leaf, move all children from sibling to child
    if (!child.isLeaf) {
      for (const childNode of sibling.children) {
        child.children.push(childNode);
      }
    }
    
    // Remove key from parent
    parent.keys.splice(index, 1);
    
    // Remove sibling from parent's children
    parent.children.splice(index + 1, 1);
  }
  
  fillChild(parent: BTreeNode, index: number): void {
    if (index !== 0 && parent.children[index - 1].keys.length >= this.order) {
      // Borrow from left sibling
      this.borrowFromPrev(parent, index);
    } else if (index !== parent.children.length - 1 && parent.children[index + 1].keys.length >= this.order) {
      // Borrow from right sibling
      this.borrowFromNext(parent, index);
    } else {
      // Merge with sibling
      if (index !== parent.children.length - 1) {
        this.mergeNodes(parent, index);
      } else {
        this.mergeNodes(parent, index - 1);
      }
    }
  }
  
  borrowFromPrev(parent: BTreeNode, index: number): void {
    const child = parent.children[index];
    const sibling = parent.children[index - 1];
    
    // Shift all keys in child
    child.keys.unshift(parent.keys[index - 1]);
    
    // Update parent key
    parent.keys[index - 1] = sibling.keys[sibling.keys.length - 1];
    
    // If not leaf, move last child of sibling to child
    if (!child.isLeaf) {
      child.children.unshift(sibling.children[sibling.children.length - 1]);
      sibling.children.pop();
    }
    
    // Remove key from sibling
    sibling.keys.pop();
  }
  
  borrowFromNext(parent: BTreeNode, index: number): void {
    const child = parent.children[index];
    const sibling = parent.children[index + 1];
    
    // Add parent key to child
    child.keys.push(parent.keys[index]);
    
    // Update parent key
    parent.keys[index] = sibling.keys[0];
    
    // If not leaf, move first child of sibling to child
    if (!child.isLeaf) {
      child.children.push(sibling.children[0]);
      sibling.children.shift();
    }
    
    // Remove key from sibling
    sibling.keys.shift();
  }
  
  inOrderTraversal(): number[] {
    const result: number[] = [];
    this.inOrder(this.root, result);
    return result;
  }
  
  inOrder(node: BTreeNode | null, result: number[]): void {
    if (!node) return;
    
    let i;
    for (i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf) {
        this.inOrder(node.children[i], result);
      }
      result.push(node.keys[i]);
    }
    
    if (!node.isLeaf) {
      this.inOrder(node.children[i], result);
    }
  }

  getTreeData() {
    return this.root;
  }
}
