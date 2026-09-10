import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Reused across hot reloads / serverless invocations so we don't open a new
// connection pool on every request.
declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example)."
    );
  }

  if (!cache.promise) {
    // Server components fire several queries concurrently per request
    // (Promise.all). On a freshly opened connection the pool only has one
    // socket ready, so a burst like that forces multiple new sockets to be
    // opened at once — and a query sent on a socket before its handshake
    // finishes can come back empty instead of erroring. minPoolSize plus an
    // equally-sized burst of warm-up pings forces those sockets to exist
    // and be ready *before* any real request can race them.
    const WARM_CONNECTIONS = 10;
    cache.promise = mongoose
      .connect(MONGODB_URI, { minPoolSize: WARM_CONNECTIONS })
      .then(async (instance) => {
        const admin = instance.connection.db?.admin();
        if (admin) {
          await Promise.all(
            Array.from({ length: WARM_CONNECTIONS }, () => admin.ping())
          );
        }
        return instance;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
