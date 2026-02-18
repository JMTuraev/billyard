const cors = require("cors")({ origin: true });

const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({
  region: "europe-west1",
  maxInstances: 10,
  memory: "512MiB",
});

const TUYA_ACCESS_ID = defineSecret("TUYA_ACCESS_ID");
const TUYA_ACCESS_SECRET = defineSecret("TUYA_ACCESS_SECRET");

const TUYA_ENDPOINT = "https://openapi.tuyaeu.com";

/* ======================================================
   TUYA TOKEN CACHE (2 soat amal qiladi)
====================================================== */
let cachedToken = null;
let tokenExpireTime = 0;

async function getToken(ACCESS_ID, ACCESS_SECRET) {
  const now = Date.now();

  if (cachedToken && now < tokenExpireTime) {
    return cachedToken;
  }

  const t = now.toString();
  const path = "/v1.0/token?grant_type=1";

  const contentHash = crypto
    .createHash("sha256")
    .update("")
    .digest("hex");

  const stringToSign = ["GET", contentHash, "", path].join("\n");
  const signStr = ACCESS_ID + t + stringToSign;

  const sign = crypto
    .createHmac("sha256", ACCESS_SECRET)
    .update(signStr)
    .digest("hex")
    .toUpperCase();

  const res = await axios.get(TUYA_ENDPOINT + path, {
    headers: {
      client_id: ACCESS_ID,
      sign,
      t,
      sign_method: "HMAC-SHA256",
    },
  });

  if (!res.data.success) {
    throw new Error("TUYA TOKEN ERROR: " + JSON.stringify(res.data));
  }

  cachedToken = res.data.result.access_token;

  // Tuya token 7200 sekund (2 soat)
  tokenExpireTime = now + 1000 * 60 * 110; // 110 min buffer bilan

  return cachedToken;
}

/* ======================================================
   SWITCH DEVICE
====================================================== */
async function switchDevice(deviceId, value, ACCESS_ID, ACCESS_SECRET) {
  const token = await getToken(ACCESS_ID, ACCESS_SECRET);
  const t = Date.now().toString();

  const body = JSON.stringify({
    commands: [{ code: "switch_1", value }],
  });

  const path = `/v1.0/iot-03/devices/${deviceId}/commands`;

  const contentHash = crypto
    .createHash("sha256")
    .update(body)
    .digest("hex");

  const stringToSign = ["POST", contentHash, "", path].join("\n");
  const signStr = ACCESS_ID + token + t + stringToSign;

  const sign = crypto
    .createHmac("sha256", ACCESS_SECRET)
    .update(signStr)
    .digest("hex")
    .toUpperCase();

  const res = await axios.post(TUYA_ENDPOINT + path, body, {
    headers: {
      client_id: ACCESS_ID,
      access_token: token,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      "Content-Type": "application/json",
    },
  });

  if (!res.data.success) {
    throw new Error("TUYA SWITCH ERROR: " + JSON.stringify(res.data));
  }

  return res.data;
}

/* ======================================================
   AUTH MIDDLEWARE
====================================================== */
async function verifyUser(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const idToken = header.split("Bearer ")[1];
  return await admin.auth().verifyIdToken(idToken);
}

/* ======================================================
   START TABLE
====================================================== */
exports.startTable = onRequest(
  { secrets: [TUYA_ACCESS_ID, TUYA_ACCESS_SECRET] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const user = await verifyUser(req);
        const { clubId, tableId } = req.body;

        const ACCESS_ID = TUYA_ACCESS_ID.value();
        const ACCESS_SECRET = TUYA_ACCESS_SECRET.value();

        const tableRef = db
          .collection("clubs")
          .doc(clubId)
          .collection("tables")
          .doc(tableId);

        let tableData;

        await db.runTransaction(async (tx) => {
          const snap = await tx.get(tableRef);
          if (!snap.exists) throw new Error("Table not found");

          const table = snap.data();

          if (table.status === "busy") {
            throw new Error("Table already busy");
          }

          if (!table.deviceId) {
            throw new Error("No device linked");
          }

          tableData = table;

          const sessionRef = db
            .collection("clubs")
            .doc(clubId)
            .collection("sessions")
            .doc();

          tx.set(sessionRef, {
            tableId,
            deviceId: table.deviceId,
            openedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "open",
            pricePerHour: table.pricePerHour,
            createdBy: user.uid,
          });

          tx.update(tableRef, {
            status: "busy",
            currentSessionId: sessionRef.id,
          });
        });

        await switchDevice(
          tableData.deviceId,
          true,
          ACCESS_ID,
          ACCESS_SECRET
        );

        res.json({ success: true });
      } catch (err) {
        logger.error(err);
        res.status(500).json({ error: err.message });
      }
    });
  }
);

/* ======================================================
   STOP TABLE
====================================================== */
exports.stopTable = onRequest(
  { secrets: [TUYA_ACCESS_ID, TUYA_ACCESS_SECRET] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const user = await verifyUser(req);
        const { clubId, tableId } = req.body;

        const ACCESS_ID = TUYA_ACCESS_ID.value();
        const ACCESS_SECRET = TUYA_ACCESS_SECRET.value();

        const tableRef = db
          .collection("clubs")
          .doc(clubId)
          .collection("tables")
          .doc(tableId);

        let tableData;
        let sessionRef;

        await db.runTransaction(async (tx) => {
          const snap = await tx.get(tableRef);
          if (!snap.exists) throw new Error("Table not found");

          const table = snap.data();

          if (table.status !== "busy") {
            throw new Error("Table already free");
          }

          tableData = table;
          sessionRef = db
            .collection("clubs")
            .doc(clubId)
            .collection("sessions")
            .doc(table.currentSessionId);

          const sessionSnap = await tx.get(sessionRef);
          const session = sessionSnap.data();

          const openedAt = session.openedAt.toDate();
          const closedAt = new Date();

          const minutes = Math.ceil(
            (closedAt - openedAt) / 1000 / 60
          );

          const amount =
            (minutes / 60) * session.pricePerHour;

          tx.update(sessionRef, {
            closedAt: admin.firestore.FieldValue.serverTimestamp(),
            durationMinutes: minutes,
            totalAmount: Math.round(amount),
            status: "closed",
            closedBy: user.uid,
          });

          tx.update(tableRef, {
            status: "free",
            currentSessionId: null,
          });
        });

        await switchDevice(
          tableData.deviceId,
          false,
          ACCESS_ID,
          ACCESS_SECRET
        );

        res.json({ success: true });
      } catch (err) {
        logger.error(err);
        res.status(500).json({ error: err.message });
      }
    });
  }
);
  