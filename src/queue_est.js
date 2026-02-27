// queue_est.js (server via norebus.php only)
// - station_lists/*.json を読まない
// - stops/routes/destinations/calc を norebus.php から取得する

const API_BASE = "https://cloverfes.com/opendata_test/norebus.php"; // 例: "/opendata_test/norebus.php" などに変更

document.addEventListener("DOMContentLoaded", () => {
  const isSearchPage = document.getElementById("searchForm") !== null;
  if (isSearchPage) initSearchPage();
  else initResultPage();
});

async function apiGet(params) {
  const url = `${API_BASE}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.ok !== true) throw new Error(json?.error || "API error");
  return json.data;
}

// ==========================================
// 1) 検索画面 (bus_wait.html)
// ==========================================
async function initSearchPage() {
  const stopSel = document.getElementById("departure");
  const routeSel = document.getElementById("route");
  const destSel = document.getElementById("destination");
  const statusArea = document.getElementById("status-area");
  const searchForm = document.getElementById("searchForm");

  // 初期化
  routeSel.innerHTML = '<option value="">-- 先に停留所を選んでください --</option>';
  routeSel.disabled = true;
  destSel.innerHTML = '<option value="">-- 先に系統を選んでください --</option>';
  destSel.disabled = true;

  // stopsをサーバから取得して停留所を埋める
  statusArea.style.display = "block";
  statusArea.className = "";
  statusArea.innerText = "停留所リストを読み込み中...";

  try {
    const data = await apiGet({ action: "stops" });
    const stops = data.stops || [];

    stopSel.innerHTML = '<option value="">-- 出発停留所を選択 --</option>';
    stops.forEach((name) => stopSel.add(new Option(name, name)));

    statusArea.style.display = "none";
  } catch (e) {
    console.error(e);
    statusArea.className = "error";
    statusArea.innerText = "❌ 停留所リストの取得に失敗しました";
    return;
  }

  // (1段階目) 停留所→routes
  stopSel.addEventListener("change", async function () {
    const station = this.value;

    routeSel.innerHTML = '<option value="">-- 系統を選択してください --</option>';
    routeSel.disabled = true;
    destSel.innerHTML = '<option value="">-- 先に系統を選んでください --</option>';
    destSel.disabled = true;

    if (!station) return;

    statusArea.style.display = "block";
    statusArea.className = "";
    statusArea.innerText = "系統リストを読み込み中...";

    try {
      const data = await apiGet({ action: "routes", stopName: station });
      const routes = data.routes || [];

      // routes: [{route_id,label}, ...]
      routes.forEach((r) => routeSel.add(new Option(r.label, r.route_id)));

      routeSel.disabled = false;
      statusArea.style.display = "none";
    } catch (e) {
      console.error(e);
      statusArea.className = "error";
      statusArea.innerText = "❌ 系統リストの取得に失敗しました";
    }
  });

  // (2段階目) 系統→destinations
  routeSel.addEventListener("change", async function () {
    const station = stopSel.value;
    const routeId = this.value;

    destSel.innerHTML = '<option value="">-- 行き先を選択してください --</option>';
    destSel.disabled = true;

    if (!station || !routeId) return;

    statusArea.style.display = "block";
    statusArea.className = "";
    statusArea.innerText = "行き先リストを読み込み中...";

    try {
      const data = await apiGet({
        action: "destinations",
        stopName: station,
        routeId: routeId,
      });

      const dests = data.destinations || [];
      dests.forEach((d) => destSel.add(new Option(d, d)));

      destSel.disabled = false;
      statusArea.style.display = "none";
    } catch (e) {
      console.error(e);
      statusArea.className = "error";
      statusArea.innerText = "❌ 行き先リストの取得に失敗しました";
    }
  });

  // 検索ボタン → 結果ページへ
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const station = stopSel.value;
    const routeId = routeSel.value;
    const dest = destSel.value;
    const queue = document.getElementById("queue").value;
    const capacity = document.getElementById("capacity").value;
    
    if (!station || !routeId || !dest || !queue || !capacity) return;

    const params = new URLSearchParams({
      station,
      routeId,
      dest,
      queue,
      capacity,
    });

    window.location.href = `ans_bus_wait.html?${params.toString()}`;
    
  });
}

// ==========================================
// 2) 結果画面 (ans_bus_wait.html)
// ==========================================
async function initResultPage() {
  const params = new URLSearchParams(window.location.search);
  const station = params.get("station");
  const routeId = params.get("routeId");
  const dest = params.get("dest");
  const queue = parseInt(params.get("queue"), 10);
  const capacity = parseInt(params.get("capacity"), 10);

  document.getElementById("backBtn")?.addEventListener("click", () => window.history.back());

  const resultArea = document.getElementById("resultArea");
  const timeArea = document.getElementById("timeArea");

  if (!station || !routeId || !dest || Number.isNaN(queue) || Number.isNaN(capacity)) {
    resultArea.innerHTML = "<p>❌ 情報が不足しています</p>";
    timeArea.innerHTML = "";
    return;
  }

  // 条件表示
  document.getElementById("disp-station").innerText = station;
  document.getElementById("disp-route").innerText = routeId; // 表示は routeId(=系統文字列) をそのまま
  document.getElementById("disp-dest").innerText = dest;
  document.getElementById("disp-queue").innerText = `前に${queue}人`;
  document.getElementById("disp-capacity").innerText = `一度に${capacity}人`;

  try {
    const data = await apiGet({
      action: "calc",
      stopName: station,
      routeId: routeId,
      dest: dest,
      queue: String(queue),
      capacity: String(capacity),
    });

    // norebus.php 側の返却を想定
    // - status: ok | finished | overflow
    if (data.status === "finished") {
      resultArea.innerHTML = "<p>本日のこの系統の<br>運行は終了しました</p>";
      timeArea.innerHTML = "";
      return;
    }

    if (data.status === "overflow") {
      resultArea.innerHTML = `<p>行列が長すぎます。<br>${data.message || "残り便では乗れない可能性があります。"}</p>`;
      timeArea.innerHTML = "";
      return;
    }

    if (data.status !== "ok") {
      throw new Error("Unexpected status");
    }

    // 表示（targetBusIndex は 0始まり）
    const busNumber = (data.targetBusIndex ?? 0) + 1;
    const waitMin = data.waitMin ?? null;
    const targetTime = data.targetTime ?? "";

    resultArea.innerHTML = `
      <p>あなたが<br>乗れるバスは、</p>
      <div class="highlight-buses">
        <span class="circle-placeholder">${busNumber}</span>
        <span class="text-suffix">台目</span>
      </div>
    `;

    if (waitMin === null) {
      timeArea.innerHTML = `到着予定: ${targetTime}`;
    } else {
      timeArea.innerHTML = `到着予定: ${targetTime} (約 <b>${waitMin} 分後</b>)`;
    }
  } catch (e) {
    console.error(e);
    resultArea.innerHTML = "<p>❌ 計算エラーが発生しました</p>";
    timeArea.innerHTML = "";
  }
}

document.getElementById("img_queue").addEventListener("change", e => {
  const img = document.getElementById("img_queue").files[0];
  if(img)
  {
    console.log(img);
    sendImage(img, DEFAULT_URL);
  }
});
