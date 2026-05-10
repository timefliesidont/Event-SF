class IntervalNode {
    constructor(interval) {
      this.interval = interval;        // { low, high }
      this.max = interval.high;        // max endpoint in subtree
      this.left = null;
      this.right = null;
      this.height = 1;                 // for AVL balancing
    }
  }
  
  class IntervalTree {
    constructor() {
      this.root = null;
    }
  
    // Node height
    _height(node) {
      return node ? node.height : 0;
    }
  
    // Update height & max
    _update(node) {
      node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
      node.max = Math.max(
        node.interval.high,
        node.left?.max || -Infinity,
        node.right?.max || -Infinity
      );
    }
  
    // Right rotation
    _rotateRight(y) {
      const x = y.left;
      y.left = x.right;
      x.right = y;
      this._update(y);
      this._update(x);
      return x;
    }
  
    // Left rotation
    _rotateLeft(x) {
      const y = x.right;
      x.right = y.left;
      y.left = x;
      this._update(x);
      this._update(y);
      return y;
    }
  
    // Balance factor
    _getBalance(node) {
      return node ? this._height(node.left) - this._height(node.right) : 0;
    }
  
    // Insert helper
    _insert(node, interval) {
      if (!node) return new IntervalNode(interval);
  
      if (interval.low < node.interval.low) {
        node.left = this._insert(node.left, interval);
      } else {
        node.right = this._insert(node.right, interval);
      }
  
      this._update(node);
      const balance = this._getBalance(node);
  
      // LL
      if (balance > 1 && interval.low < node.left.interval.low) {
        return this._rotateRight(node);
      }
      // RR
      if (balance < -1 && interval.low >= node.right.interval.low) {
        return this._rotateLeft(node);
      }
      // LR
      if (balance > 1 && interval.low >= node.left.interval.low) {
        node.left = this._rotateLeft(node.left);
        return this._rotateRight(node);
      }
      // RL
      if (balance < -1 && interval.low < node.right.interval.low) {
        node.right = this._rotateRight(node.right);
        return this._rotateLeft(node);
      }
  
      return node;
    }
  
    /** Public: insert({low, high}) **/
    insert(interval) {
      this.root = this._insert(this.root, interval);
    }
  
    /** Overlap check **/
    static _overlap(a, b) {
      return a.low <= b.high && b.low <= a.high;
    }
  
    /** Search any overlapping **/
    searchAny(query) {
      let node = this.root;
      while (node) {
        if (IntervalTree._overlap(node.interval, query)) {
          return node.interval;
        }
        if (node.left && node.left.max >= query.low) {
          node = node.left;
        } else {
          node = node.right;
        }
      }
      return null;
    }
  
    /** Search all overlapping **/
    _searchAll(node, query, result) {
      if (!node) return;
      if (node.left && node.left.max >= query.low) {
        this._searchAll(node.left, query, result);
      }
      if (IntervalTree._overlap(node.interval, query)) {
        result.push(node.interval);
      }
      if (node.interval.low <= query.high) {
        this._searchAll(node.right, query, result);
      }
    }
  
    searchAll(query) {
      const result = [];
      this._searchAll(this.root, query, result);
      return result;
    }
  }
  
  export default IntervalTree;