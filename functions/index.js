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
});

const TUYA_ACCESS_ID = defineSecret("TUYA_ACCESS_ID");
const TUYA_ACCESS_SECRET = defineSecret("TUYA_ACCESS_SECRET");

const TUYA_ENDPOINT = "https://openapi.tuyaeu.com";

/* ================= SIGN ================= */
function sign(method, path, body, t, ACCESS_ID, ACCESS_SECRET, token = "") {
  const contentHash = crypto
    .createHash("sha256")
    .update(body || "")
    .digest("hex");

  const stringToSign = [method, contentHash, "", path].join("\n");
  const signStr = ACCESS_ID + token + t + stringToSign;

  return crypto
    .createHmac("sha256", ACCESS_SECRET)
    .update(signStr)
    .digest("hex")
    .toUpperCase();
}

/* ================= GET TOKEN ================= */
async function getToken(ACCESS_ID, ACCESS_SECRET) {
  const t = Date.now().toString();
  const path = "/v1.0/token?grant_type=1";

  const signValue = sign("GET", path, "", t, ACCESS_ID, ACCESS_SECRET);

  const res = await axios.get(TUYA_ENDPOINT + path, {
    headers: {
      client_id: ACCESS_ID,
      sign: signValue,
      t,
      sign_method: "HMAC-SHA256",
    },
  });

  logger.info("TUYA TOKEN RESPONSE:", res.data);

  if (!res.data.success) {
    throw new Error(JSON.stringify(res.data));
  }

  return res.data.result.access_token;
}

/* ================= SWITCH DEVICE ================= */
async function switchDevice(deviceId, value, ACCESS_ID, ACCESS_SECRET) {
  const token = await getToken(ACCESS_ID, ACCESS_SECRET);
  const t = Date.now().toString();

  const body = JSON.stringify({
    commands: [
      {
        code: "switch_1",
        value,
      },
    ],
  });

  const path = `/v1.0/iot-03/devices/${deviceId}/commands`;

  const signValue = sign(
    "POST",
    path,
    body,
    t,
    ACCESS_ID,
    ACCESS_SECRET,
    token
  );

  const res = await axios.post(TUYA_ENDPOINT + path, body, {
    headers: {
      client_id: ACCESS_ID,
      access_token: token,
      sign: signValue,
      t,
      sign_method: "HMAC-SHA256",
      "Content-Type": "application/json",
    },
  });

  logger.info("TUYA SWITCH RESPONSE:", res.data);

  return res.data;
}

/* ================= START TABLE ================= */
exports.startTable = onRequest(
  { secrets: [TUYA_ACCESS_ID, TUYA_ACCESS_SECRET] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        logger.info("START REQUEST BODY:", req.body);

        const { clubId, tableId } = req.body;

        const ACCESS_ID = TUYA_ACCESS_ID.value();
        const ACCESS_SECRET = TUYA_ACCESS_SECRET.value();

        const tableRef = db
          .collection("clubs")
          .doc(clubId)
          .collection("tables")
          .doc(tableId);

        const tableSnap = await tableRef.get();
        const table = tableSnap.data();

        logger.info("TABLE DATA:", table);

        if (!table?.deviceId) {
          return res.status(400).json({ error: "No deviceId" });
        }

        await switchDevice(
          table.deviceId,
          true,
          ACCESS_ID,
          ACCESS_SECRET
        );

        const sessionRef = await db
          .collection("clubs")
          .doc(clubId)
          .collection("sessions")
          .add({
            tableId,
            tableNumber: table.number,
            pricePerHour: table.pricePerHour,
            openedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "open",
            amountPaid: 0,
          });

        await tableRef.update({
          status: "busy",
          currentSessionId: sessionRef.id,
        });

        res.json({ success: true });
      } catch (error) {
        logger.error("START ERROR:", error);
        res.status(500).json({ error: error.message });
      }
    });
  }
);

/* ================= STOP TABLE ================= */
exports.stopTable = onRequest(
  { secrets: [TUYA_ACCESS_ID, TUYA_ACCESS_SECRET] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        logger.info("STOP REQUEST BODY:", req.body);

        const { clubId, tableId } = req.body;

        const ACCESS_ID = TUYA_ACCESS_ID.value();
        const ACCESS_SECRET = TUYA_ACCESS_SECRET.value();

        const tableRef = db
          .collection("clubs")
          .doc(clubId)
          .collection("tables")
          .doc(tableId);

        const tableSnap = await tableRef.get();
        const table = tableSnap.data();

        logger.info("TABLE DATA:", table);

        await switchDevice(
          table.deviceId,
          false,
          ACCESS_ID,
          ACCESS_SECRET
        );

        await tableRef.update({
          status: "free",
          currentSessionId: null,
        });

        res.json({ success: true });
      } catch (error) {
        logger.error("STOP ERROR:", error);
        res.status(500).json({ error: error.message });
      }
    });
  }
);
