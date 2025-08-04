// src/api/stores.js
import { getValidToken } from "./auth";

// Fetch stores linked to current user
export async function fetchUserStores() {
  const token = await getValidToken();
  const currentEmail = localStorage.getItem("user_email");

  if (!token || !currentEmail) {
    console.warn("[fetchUserStores] Missing token or user_email");
    throw {
      message: "❌ Missing authentication. Please login again.",
      type: "error",
    };
  }

  try {
    const res = await fetch("/api/stores/by_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: currentEmail }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[fetchUserStores] Failed:", text);
      throw { message: `❌ HTTP ${res.status} - ${text}`, type: "error" };
    }

    const data = JSON.parse(text);
    return data.stores || [];
  } catch (e) {
    console.error("[fetchUserStores] Error:", e.message);
    throw { message: e.message || "❌ Failed to fetch stores.", type: "error" };
  }
}

// Fetch today's data if store has cameras
export async function fetchTodayDataIfStoreHasCameras(storeOrList) {
  const token = await getValidToken();
  const today = new Date().toISOString().split("T")[0];

  let store = null;
  if (Array.isArray(storeOrList)) {
    if (storeOrList.length === 0) {
      throw { message: "❌ You don’t have a store", type: "warning" };
    }
    store = storeOrList.find((s) => s.cameras && s.cameras.length > 0);
    if (!store) {
      throw { message: "⚠️ None of your stores have cameras", type: "warning" };
    }
  } else if (storeOrList && typeof storeOrList === "object") {
    store = storeOrList;
    if (!store.cameras || store.cameras.length === 0) {
      throw { message: "⚠️ Your store has no cameras", type: "warning" };
    }
  } else {
    throw { message: "❌ Invalid store input", type: "error" };
  }

  try {
    const res = await fetch("/api/store_data/day", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ store: store.name, day: today }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[fetchTodayDataIfStoreHasCameras] Failed:", text);
      throw { message: `❌ HTTP ${res.status} - ${text}`, type: "error" };
    }

    const data = JSON.parse(text);
    console.log("[fetchTodayDataIfStoreHasCameras] Data:", data);
    return data;
  } catch (e) {
    console.error("[fetchTodayDataIfStoreHasCameras] Error:", e.message);
    throw {
      message: e.message || "❌ Failed to fetch today's data.",
      type: "error",
    };
  }
}

// POST /store_data/time
export async function fetchDataByTime({
  store,
  date,
  startTime = "00:00",
  endTime = "23:59",
}) {
  const token = await getValidToken();

  if (!store || !date) {
    throw { message: "❌ 'store' and 'date' are required", type: "warning" };
  }

  try {
    const res = await fetch("/api/store_data/time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ store, date, startTime, endTime }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[fetchDataByTime] Failed:", text);
      throw { message: `❌ HTTP ${res.status} - ${text}`, type: "error" };
    }

    const data = JSON.parse(text);
    console.log("[fetchDataByTime] Data:", data);
    return data;
  } catch (e) {
    console.error("[fetchDataByTime] Error:", e.message);
    throw {
      message: e.message || "❌ Failed to fetch data by time.",
      type: "error",
    };
  }
}

// POST /store_data/period
export async function fetchDataByPeriod({ store, start, end }) {
  const token = await getValidToken();

  if (!store || !start) {
    throw { message: "❌ 'store' and 'start' are required", type: "warning" };
  }

  try {
    const res = await fetch("/api/store_data/period", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ store, start, end }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[fetchDataByPeriod] Failed:", text);
      throw { message: `❌ HTTP ${res.status} - ${text}`, type: "error" };
    }

    const rawData = JSON.parse(text);
    console.log("[fetchDataByPeriod] Raw:", rawData);

    const transformed = Object.entries(rawData).map(([date, entries]) => {
      const total = entries.reduce(
        (sum, e) => sum + parseInt(e.enterCount || "0", 10),
        0,
      );
      return { date, total };
    });

    return transformed.sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.error("[fetchDataByPeriod] Error:", e.message);
    throw {
      message: e.message || "❌ Failed to fetch period data.",
      type: "error",
    };
  }
}

// POST /store_data/days_time
export async function fetchDataByDaysWithTime({
  store,
  days,
  startTime = "00:00",
  endTime = "23:59",
}) {
  const token = await getValidToken();

  if (!store || !Array.isArray(days) || days.length === 0) {
    throw {
      message: "❌ 'store' and non-empty 'days' list required",
      type: "warning",
    };
  }

  try {
    const res = await fetch("/api/store_data/days_time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ store, days, startTime, endTime }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[fetchDataByDaysWithTime] Failed:", text);
      throw { message: `❌ HTTP ${res.status} - ${text}`, type: "error" };
    }

    const data = JSON.parse(text);
    console.log("[fetchDataByDaysWithTime] Data:", data);
    return data;
  } catch (e) {
    console.error("[fetchDataByDaysWithTime] Error:", e.message);
    throw {
      message: e.message || "❌ Failed to fetch data by days/time.",
      type: "error",
    };
  }
}
// POST /store_data/day (single or multiple days)
export async function fetchDataByDayOrDays({ store, day = null, days = null }) {
  const token = await getValidToken();

  if (!store || (!day && !Array.isArray(days))) {
    throw {
      message: "❌ 'store' and either 'day' or 'days' required",
      type: "warning",
    };
  }

  const body = { store };
  if (Array.isArray(days)) body.days = days;
  else if (day) body.day = day;

  try {
    console.log("[fetchDataByDayOrDays] Request body:", body);
    const res = await fetch("/api/store_data/day", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[fetchDataByDayOrDays] Failed:", text);
      throw { message: `❌ HTTP ${res.status} - ${text}`, type: "error" };
    }

    const rawData = JSON.parse(text);
    console.log("[fetchDataByDayOrDays] Raw:", rawData);

    // ✅ transform per-day totals
    const transformed = Object.entries(rawData).map(([date, entries]) => {
      const total = entries.reduce(
        (sum, e) => sum + parseInt(e.enterCount || "0", 10),
        0
      );
      return { date, total };
    });

    return transformed.sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.error("[fetchDataByDayOrDays] Error:", e.message);
    throw {
      message: e.message || "❌ Failed to fetch day(s) data.",
      type: "error",
    };
  }
}
