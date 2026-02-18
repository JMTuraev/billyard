import api from "../services/api";

/* ================= START TABLE ================= */
export const startTable = (clubId, tableId) => {
  return api.post("/startTable", { clubId, tableId });
};

/* ================= STOP TABLE ================= */
export const stopTable = (clubId, tableId) => {
  return api.post("/stopTable", { clubId, tableId });
};
