// Simulation of a background task like fetching live crypto prices
self.onmessage = function(e) {
  if (e.data === 'start') {
    setInterval(() => {
      const price = (Math.random() * (1.001 - 0.999) + 0.999).toFixed(4);
      self.postMessage({ type: 'price_update', price: price });
    }, 5000);
  }
};
