let numerOfFunctions = 4;
let drawInterval;

const TAU = Math.PI * 2.0;
const INTERVAL = Math.pow(10.0, -3.1);
const SCALE = 64.0;
let y = 128.0;
let timeStart = new Date().getTime();
let time = 0;

self.addEventListener("install", e =>
  // @ts-ignore
  e.waitUntil(self.skipWaiting())
);
self.addEventListener("activate", e =>
  // @ts-ignore
  e.waitUntil(self.clients.claim())
);

self.addEventListener("message", handleMessage);

/**
 * Functions which handles message event from main thread
 * @param e               - MessageEvent
 */
function handleMessage(e: MessageEvent): void {
  const { message } = e.data;

  switch (message) {
    case "START":
      timeStart = new Date().getTime();
      drawInterval = setInterval(draw, INTERVAL);
      break;
    case "STOP":
      clearInterval(drawInterval);
      break;
    case "CHANGE_NUM_OF_FUNCTIONS":
      numerOfFunctions = e.data.numOfFunctions;
      break;
  }
}

/**
 * Functions, which sends message to main thread
 * @param message           - Message to sent
 */
function messageWithAnimationData(message: any): void {
  // @ts-ignore
  self.clients.matchAll().then(all =>
    all.forEach(client => {
      client.postMessage(message);
    })
  );
}

/**
 * Functions, which counts current y value of series
 * @param order             - Sin function number which is being counted at the moment
 */
function countAnimation(order: number): void {
  const phase = order * time * TAU;
  const radius = (4.0 / (order * Math.PI)) * SCALE;

  y += Math.sin(phase) * radius;
}

/**
 * Draw handler - sends new cords to the main thread and counts needed stuff
 */
function draw(): void {
  y = 128.0;

  for (let order = 0; order <= numerOfFunctions; order++) {
    countAnimation((order << 1) + 1);
  }

  messageWithAnimationData({
    y
  });

  const now = new Date().getTime();
  time += (now - timeStart) * INTERVAL;
  timeStart = now;
}
