let serviceWorker;
let canvas;
const values = [];
let valuePointer = 0;
document.addEventListener("DOMContentLoaded", async () => {
    serviceWorker = await init();
});
/**
 * Initialize function, which is invoked on DOMContentLoaded
 */
async function init() {
    const menuLinks = document.getElementById("mainNavbar").children;
    const numberOfCirclesInput = document.getElementById("numerOfFunctions");
    canvas = document.getElementById("visualisation");
    for (const menuLink of menuLinks) {
        menuLink.addEventListener("click", e => {
            if (!(e.target instanceof HTMLAnchorElement)) {
                return;
            }
            openTab(e.target.dataset.tab);
        });
    }
    numberOfCirclesInput.addEventListener("change", () => {
        changeNumberOfFunctions(parseInt(numberOfCirclesInput.value, 10));
    });
    try {
        const sw = await registerServiceWorker();
        navigator.serviceWorker.addEventListener("message", event => window.requestAnimationFrame(() => drawPointToCanvas(event.data)));
        return sw;
    }
    catch (e) {
        console.log("Error while registering service worker");
        console.error(e);
    }
}
/**
 * Helper function, which openes one of the website tabs
 * @param tabId               - ID of TAB to open
 */
function openTab(tabId) {
    const newTab = document.getElementById(tabId);
    const openedTab = document.querySelector('article:not([hidden="hidden"])');
    if (newTab && openedTab && newTab !== openedTab) {
        newTab.removeAttribute("hidden");
        newTab.classList.add("animated");
        newTab.classList.add("fadeIn");
        openedTab.setAttribute("hidden", "hidden");
        openedTab.classList.remove("animated");
        openedTab.classList.remove("fadeIn");
        if (tabId === "fourierSeriesVisualisation") {
            toggleDrawing(true);
        }
        if (openedTab.id === "fourierSeriesVisualisation") {
            toggleDrawing(false);
        }
    }
}
/**
 * Functions, which registers service worker
 */
async function registerServiceWorker() {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
        await registration.unregister();
    }
    return navigator.serviceWorker.register("/serviceWorker.js");
}
/**
 * Tells service worker to start/stop counting fourier series points
 * @param shouldDraw         - Should/should not count
 */
function toggleDrawing(shouldDraw) {
    const message = shouldDraw ? "START" : "STOP";
    serviceWorker.active.postMessage({
        message
    });
}
/**
 * Functions, which sends new number of sin functions to the service worker
 * @param numOfFunctions     - New number of functions
 */
function changeNumberOfFunctions(numOfFunctions = 1) {
    serviceWorker.active.postMessage({
        message: "CHANGE_NUM_OF_FUNCTIONS",
        numOfFunctions
    });
}
/**
 * Function, which draws points to the canvas
 * @param pointData         - Object with current y values of Fourier's Series
 */
function drawPointToCanvas(pointData) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    values[valuePointer++ & 255] = pointData.y;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(193,5,113,1)";
    ctx.moveTo(256 + 0.1, pointData.y + 0.1);
    for (let i = 1; i < 256; ++i) {
        ctx.lineTo(256 + i + 0.1, values[(valuePointer - i) & 255] + 0.1);
    }
    ctx.stroke();
}
//# sourceMappingURL=app.js.map