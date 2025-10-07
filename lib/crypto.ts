export async function deriveKey(password: string, salt: Uint8Array | string) {
  const enc = new TextEncoder()
  const saltBytes = typeof salt === "string" ? Uint8Array.from(atob(salt), (c) => c.charCodeAt(0)) : salt
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 200_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
  return key
}

export async function encryptJSON(key: CryptoKey, data: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const payload = new TextEncoder().encode(JSON.stringify(data))
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload)
  return {
    iv: btoa(String.fromCharCode(...iv)),
    ct: btoa(String.fromCharCode(...new Uint8Array(buf))),
    v: 1,
  }
}

export async function decryptJSON<T = any>(key: CryptoKey, packet: { iv: string; ct: string }) {
  const iv = Uint8Array.from(atob(packet.iv), (c) => c.charCodeAt(0))
  const ct = Uint8Array.from(atob(packet.ct), (c) => c.charCodeAt(0))
  const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct)
  return JSON.parse(new TextDecoder().decode(buf)) as T
}

// Utility if needed externally
export async function exportKeyBase64(key: CryptoKey) {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key))
  return btoa(String.fromCharCode(...raw))
}
