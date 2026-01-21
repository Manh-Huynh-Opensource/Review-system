// Minimal test worker - no external imports
console.log('TestWorker: Script loaded!');

self.onmessage = (e) => {
    console.log('TestWorker: Received message', e.data);
    self.postMessage({ type: 'echo', data: e.data });
};

console.log('TestWorker: Ready for messages');
