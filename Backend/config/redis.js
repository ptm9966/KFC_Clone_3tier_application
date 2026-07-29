const redis = require("redis");

const REDIS_ENABLED = String(process.env.REDIS_CACHE_ENABLED || "false").toLowerCase() === "true";

const redisHost = process.env.REDIS_HOST;
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = process.env.REDIS_PASSWORD;
const redisTls = String(process.env.REDIS_TLS || "false").toLowerCase() === "true";

let client = null;
let clientReady = false;
let redisAvailable = false;
let connectionPromise = null;
let redisRuntimeEnabled = REDIS_ENABLED;

async function initRedis() {
  if (!redisRuntimeEnabled) {
    return null;
  }

  if (client && clientReady && redisAvailable && client.isOpen) {
    return client;
  }

  if (!redisHost) {
    console.warn("Redis cache is enabled, but REDIS_HOST is not configured.");
    redisRuntimeEnabled = false;
    return null;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  client = redis.createClient({
    socket: {
      host: redisHost,
      port: redisPort,
      tls: redisTls || undefined,
    },
    password: redisPassword,
  });

  client.on("connect", () => {
    console.log("Redis client connecting...");
  });

  client.on("ready", () => {
    clientReady = true;
    redisAvailable = true;
    console.log("Redis client connected");
  });

  client.on("error", (err) => {
    redisAvailable = false;
    clientReady = false;
    redisRuntimeEnabled = false;
    console.warn("Redis client error:", err.message || err);
  });

  client.on("end", () => {
    redisAvailable = false;
    clientReady = false;
    redisRuntimeEnabled = false;
    console.warn("Redis client connection ended");
  });

  connectionPromise = client.connect()
    .then(() => client)
    .catch((err) => {
      console.warn("Unable to connect to Redis:", err.message || err);
      client = null;
      clientReady = false;
      redisAvailable = false;
      return null;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
}

async function getRedisClient() {
  if (!REDIS_ENABLED || !redisRuntimeEnabled) {
    return null;
  }

  if (client && clientReady && redisAvailable && client.isOpen) {
    return client;
  }

  return initRedis();
}

function isRedisAvailable() {
  return redisRuntimeEnabled && redisAvailable && client && client.isOpen;
}

function parseCachedValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch (err) {
    console.warn("Unable to parse Redis cache payload:", err.message || err);
    return null;
  }
}

async function safeGet(key) {
  const redisClient = await getRedisClient();
  if (!redisClient || !isRedisAvailable()) {
    console.warn(`Redis unavailable, falling back to MongoDB for GET ${key}`);
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (err) {
    redisAvailable = false;
    clientReady = false;
    console.warn(`Redis GET failed for key ${key}:`, err.message || err);
    return null;
  }
}

async function safeSet(key, value, ttlSeconds) {
  const redisClient = await getRedisClient();
  if (!redisClient || !isRedisAvailable()) {
    console.warn(`Redis unavailable, skipping SET for ${key}`);
    return;
  }

  try {
    await redisClient.set(key, value, { EX: ttlSeconds });
  } catch (err) {
    redisAvailable = false;
    clientReady = false;
    console.warn(`Redis SET failed for key ${key}:`, err.message || err);
  }
}

async function safeDel(key) {
  const redisClient = await getRedisClient();
  if (!redisClient || !isRedisAvailable()) {
    console.warn(`Redis unavailable, skipping DEL for ${key}`);
    return;
  }

  try {
    await redisClient.del(key);
  } catch (err) {
    redisAvailable = false;
    clientReady = false;
    console.warn(`Redis DEL failed for key ${key}:`, err.message || err);
  }
}

async function safeKeys(pattern) {
  const redisClient = await getRedisClient();
  if (!redisClient || !isRedisAvailable()) {
    console.warn(`Redis unavailable, skipping KEYS for ${pattern}`);
    return [];
  }

  try {
    return await redisClient.keys(pattern);
  } catch (err) {
    redisAvailable = false;
    clientReady = false;
    console.warn(`Redis KEYS failed for pattern ${pattern}:`, err.message || err);
    return [];
  }
}

module.exports = {
  REDIS_ENABLED,
  getRedisClient,
  isRedisAvailable,
  parseCachedValue,
  safeGet,
  safeSet,
  safeDel,
  safeKeys,
};
