let indexedDbInstance;
/** Keeps instance of IndexedDB **/
let temperaturesFromBackend = [];
/** Keeps data from backend **/

const tableBody = document.getElementById("temperatureTableBody");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await init();
  } catch (e) {
    console.log("Bład w trakcie inicjalizacji");
    console.error(e);
  }
});

/**
 * Init function - adds event listeners and sets up IndexedDB
 * @returns {Promise<unknown>}
 */
function init() {
  return new Promise((res, rej) => {
    window.addEventListener("online", async () => await pushDataFromIndexedDbToBackend());
    window.addEventListener("offline", async () => await pushDataFromBackendToIndexedDb());

    const valueForm = document.getElementById("temperatureForm");
    valueForm.addEventListener("submit", async e => await handleFormSubmit(e));

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async e => await handleLogin(e));

    const request = indexedDB.open("TemperatureDatabase");

    request.onerror = e => {
      rej(e);
    };

    request.onsuccess = async e => {
      indexedDbInstance = e.target.result;

      indexedDbInstance.onerror = e => {
        console.error("Database error: " + e.target.errorCode);
      };

      res();
    };

    request.onupgradeneeded = e => {
      const db = e.target.result;
      db.createObjectStore("temperatures", {autoIncrement: true});
    };
  });
}

/**
 * Function, which checks whether user is logged in or not
 * @returns {*|boolean}             - Login status
 */
function loginCheck() {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieObject = decodedCookie
    .split(';')
    .map(cookie => cookie.replace(" ", ""))
    .reduce((acc, val) => {
      const splittedCookie = val.split("=");
      return {
        ...acc,
        [splittedCookie[0]]: splittedCookie[1]
      };
    }, {});
  return cookieObject && cookieObject.PHPSESSID && cookieObject.PHPSESSID.length > 0;
}

/**
 * Function, which is invoked on internetOnline event, pushes actual data into the backend
 * @returns {Promise<void>}
 */
async function pushDataFromIndexedDbToBackend() {
  const dataFromIndexedDb = await getTemperaturesFromIndexedDb();
  if (dataFromIndexedDb && dataFromIndexedDb.length > 0) {
    await Promise.all(
      dataFromIndexedDb.map(temperature => insertTemperatureToBackend(temperature))
    );
  }

  temperaturesFromBackend = await getTemperaturesFromBackend();
  clearTable();
  temperaturesFromBackend.forEach(temperatureData => {
    const tableEntry = createTableEntry(temperatureData);
    tableBody.appendChild(tableEntry);
  });
  drawChart();

  alert("Internet wrócił - dane z IndexedDB zostały zapisane na serwerze, możesz korzystać ze strony w trybie online.");
}

/**
 * Function, which is invoked on internetOffline event, pushes actual data into the IndexedDB
 */
async function pushDataFromBackendToIndexedDb() {
  const objectStore = indexedDbInstance.transaction("temperatures", "readwrite").objectStore("temperatures");
  objectStore.clear().onsuccess = () => {
    alert("Brak internetu - możesz korzystać ze strony w trybie offline.");
  };
}

/**
 * Wrapper on the fetch function, which utilizes JSON and has error handling
 * @param url               - URL to which request shall be made
 * @param method            - HTTP request method
 * @param body              - Body of the request (only for POST/PUT requests)
 * @returns {Promise<any>}  - JSON response of request
 */
async function throwableFetch({url, method, body}) {
  try {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (["POST", "PUT"].includes(method) && body) {
      opts.body = JSON.stringify(body);
    }

    const response = await fetch(url, opts);

    return response.json();
  } catch (e) {
    console.log("Error while making request!");
    console.error(e);
  }
}

/**
 * Functions, which returns array of temperature data stored in backend
 * @returns {Promise<TemperatureData[]>}  - Array of temperature data
 */
async function getTemperaturesFromBackend() {
  return await throwableFetch({
    url: "/api/temperature",
    method: "GET"
  });
}

/**
 * Function, which allows to insert temperature data into the backend
 * @param temperatureData                 - Object with temperature data
 * @returns {Promise<TemperatureData>}    - Resolves with added data
 */
async function insertTemperatureToBackend(temperatureData) {
  return await throwableFetch({
    url: "/api/temperature",
    method: "POST",
    body: temperatureData
  });
}

/**
 * Function, which allows user to log in
 * @param email                           - User's email
 * @param password                        - User's password
 * @returns {Promise<any>}
 */
async function login(email, password) {
  return await throwableFetch({
    url: "/api/login",
    method: "POST",
    body: {
      email,
      password
    }
  });
}

/**
 * Functions, which returns array of temperature data stored in IndexedDB
 * @returns {Promise<TemperatureData[]>}  - Array of temperature data
 */
function getTemperaturesFromIndexedDb() {
  return new Promise((res, rej) => {
    const objectStore = indexedDbInstance.transaction("temperatures").objectStore("temperatures");
    objectStore.getAll().onsuccess = e => {
      res(e.target.result);
    };
    objectStore.getAll().onerror = e => {
      rej(e);
    }
  });
}

/**
 * Function which allows to insert temperature data into the IndexedDB
 * @param temperatureData                 - Object with temperature data
 * @returns {Promise<TemperatureData>}    - Resolves with added data
 */
function insertTemperatureIntoIndexedDb(temperatureData) {
  return new Promise((res, rej) => {
    const objectStore = indexedDbInstance.transaction("temperatures", "readwrite").objectStore("temperatures");
    const request = objectStore.add(temperatureData);
    request.onsuccess = () => {
      res(temperatureData);
    };
    request.onerror = e => {
      rej(e);
    }
  });
}

/**
 * Function, which clears all table entries
 */
function clearTable() {
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
}

/**
 * Creates table entry with temperatureData
 * @param temperatureData                 - Object with temperature data
 * @returns {HTMLElement | HTMLTableRowElement | any | ActiveX.IXMLDOMElement}
 */
function createTableEntry(temperatureData) {
  const tableEntry = document.createElement("tr");

  const idEntry = document.createElement("td");
  const cityEntry = document.createElement("td");
  const valueEntry = document.createElement("td");

  idEntry.textContent = temperatureData._id;
  cityEntry.textContent = temperatureData.location;
  valueEntry.textContent = temperatureData.value;

  tableEntry.append(idEntry, cityEntry, valueEntry);
  return tableEntry;
}

/**
 * Handles login form on submit event
 * @param e                               - Event details
 * @returns {Promise<void>}
 */
async function handleLogin(e) {
  e.preventDefault();

  try {
    if (navigator.onLine) {
      const email = document.getElementById("emailInput").value;
      const password = document.getElementById("passwordInput").value;

      if (!email || email.length < 8) {
        alert("Email musi mieć conajmniej 8 znaków");
        return;
      }

      if (!password || password.length < 5) {
        alert("Hasło musi mieć przynajmniej 5 znaków");
        return;
      }

      await login(email, password);

      temperaturesFromBackend = await getTemperaturesFromBackend();
      temperaturesFromBackend.forEach(temperatureData => {
        const tableEntry = createTableEntry(temperatureData);
        tableBody.appendChild(tableEntry);
      });
      drawChart();
    } else {
      alert("Nie można zalogowac - brak dostępu do internetu!");
    }
  } catch (e) {
    alert("Nie jesteś zalogowany - brak dostępu!");
    console.error(e);
  }
}

/**
 * Handles temperature data form on submit
 * @param e                                 -  Event details
 * @returns {Promise<void>}
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  const location = document.getElementById("cityInput").value;
  const value = parseFloat(document.getElementById("valueInput").value);

  if (!location || location.length < 3) {
    alert("Pole miejscowość musi mieć przynajmniej 3 znaki!");
    return;
  }

  if (!value || Number.isNaN(value)) {
    alert("Pole wartość musi być poprawną liczbą zmiennoprzecinkową!");
    return;
  }

  let temperatureData = {
    location,
    value
  };

  if (navigator.onLine) {
    temperatureData = await insertTemperatureToBackend(temperatureData);
  } else {
    await insertTemperatureIntoIndexedDb(temperatureData);
  }

  const tableEntry = createTableEntry(temperatureData);
  tableBody.appendChild(tableEntry);
  temperaturesFromBackend.push(temperatureData);
  drawChart();
}

/**
 * Draws chart with temperature data
 */
function drawChart() {
  const ctx = document.getElementById("histogram").getContext("2d");
  ctx.clearRect(0, 0, ctx.width, ctx.height);
  const histogram = new Chart(ctx, {
    type: "bar",
    data: {
      labels: temperaturesFromBackend.map(temperature => temperature.location),
      datasets: [
        {
          label: "Temperatura",
          data: temperaturesFromBackend.map(temperature => temperature.value)
        }
      ]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}
