/*********************************
 * GLOBAL VARIABLES
 *********************************/
let db = null;
let currentPayload = null;

/*********************************
 * STORAGE MODULE (IndexedDB)
 *********************************/
const request = indexedDB.open("SecureClipboardDB", 1);

request.onupgradeneeded = event => {
  const database = event.target.result;
  if (!database.objectStoreNames.contains("secureStore")) {
    database.createObjectStore("secureStore", { keyPath: "id" });
  }
};

request.onsuccess = event => {
  db = event.target.result;
  console.log("IndexedDB initialized");
};

request.onerror = () => {
  console.error("IndexedDB error");
};

function savePayload(payload) {
  if (!db) return;
  const tx = db.transaction("secureStore", "readwrite");
  tx.objectStore("secureStore").put({ id: "payload", payload });
}

function loadPayload(callback) {
  if (!db) return;
  const tx = db.transaction("secureStore", "readonly");
  const req = tx.objectStore("secureStore").get("payload");
  req.onsuccess = () => callback(req.result?.payload);
}

/*********************************
 * ENCRYPTION MODULE
 *********************************/
async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

const toB64 = buffer =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromB64 = base64 =>
  Uint8Array.from(atob(base64), c => c.charCodeAt(0));

/*********************************
 * ENCRYPT + AUTO STORE
 *********************************/
async function encryptData() {
  try {
    const key = keyInput.value.trim();
    const text = dataInput.value.trim();

    if (!key || !text) {
      setStatus("Key or data missing");
      return;
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const aesKey = await deriveKey(key, salt);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      new TextEncoder().encode(text)
    );

    currentPayload = {
      cipher: toB64(encryptedBuffer),
      iv: toB64(iv),
      salt: toB64(salt)
    };

    encryptedOutput.value = currentPayload.cipher;
    dataInput.value = "";

    savePayload(currentPayload);
    setStatus("Encrypted & stored successfully ✔");

  } catch (e) {
    console.error(e);
    setStatus("Encryption failed ❌");
  }
}

/*********************************
 * DECRYPT (FROM IndexedDB)
 *********************************/
async function decryptData() {
  try {
    const key = keyInput.value.trim();
    if (!key) {
      setStatus("Key missing");
      return;
    }

    loadPayload(async payload => {
      if (!payload) {
        setStatus("No encrypted data found");
        return;
      }

      try {
        const aesKey = await deriveKey(
          key,
          fromB64(payload.salt)
        );

        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: fromB64(payload.iv) },
          aesKey,
          fromB64(payload.cipher)
        );

        decryptedOutput.value =
          new TextDecoder().decode(decryptedBuffer);

        setStatus("Decryption successful ✔");

      } catch {
        setStatus("Wrong key or corrupted data ❌");
      }
    });

  } catch (e) {
    console.error(e);
    setStatus("Decryption failed ❌");
  }
}

/*********************************
 * CLIPBOARD MODULE (AUTO CLEAR)
 *********************************/
function copyEncrypted() {
  if (!currentPayload) {
    setStatus("No encrypted data to copy");
    return;
  }

  navigator.clipboard.writeText(currentPayload.cipher)
    .then(() => {
      setStatus("Encrypted copied ✔ (auto-clear in 60s)");

      setTimeout(async () => {
        try {
          // Overwrite clipboard multiple times
          await navigator.clipboard.writeText(" ");
          await navigator.clipboard.writeText("");
          setStatus("Clipboard auto-clear attempted 🔒");
        } catch {
          setStatus("Clipboard auto-clear restricted by browser");
        }
      }, 60000);

    })
    .catch(() => {
      setStatus("Clipboard permission denied ❌");
    });
}

