class ColorCache {
    constructor(limit = 100) {
      this.limit = limit;
      this.colors = {};
      this.keys = [];
    }
  
    get(key) {
      const value = this.colors[key];
      if (value) {
        this.keys.splice(this.keys.indexOf(key), 1);
        this.keys.push(key);
        return value;
      }
      return null;
    }
  
    set(key, value) {
      if (this.keys.length >= this.limit) {
        const evictedKey = this.keys.shift();
        delete this.colors[evictedKey];
      }
      this.colors[key] = value;
      this.keys.push(key);
    }
  }
  
  module.exports = ColorCache;
  
