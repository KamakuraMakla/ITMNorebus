/*
const DateTime = luxon.DateTime;
let gtfs = { routes: [], trips: [], stop_times: [], stops: [], calendar: [], calendar_dates: [] };

const targetStopKeywords = [
    "京都駅前", "五条坂", "清水道", "四条河原町", "四条烏丸", "四条大宮", 
    "西ノ京円町", "銀閣寺道", "金閣寺道", "百万遍", "北大路バスターミナル", 
    "国際会館駅", "烏丸今出川", "出町柳駅", "北野天満宮"
];

const day_num_convert = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function gtfsTimeToSeconds(t) {
    const parts = t.trim().split(":");
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

async function fetchCSV(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Missing: ${url}`);
    const text = await response.text();
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}

window.addEventListener('DOMContentLoaded', async () => {
    const statusArea = document.getElementById('status-area');
    //const controls = document.getElementById('controls');

    try {
        const base = "./assets/gtfs/"; 
        const [r, t, s, st, c, cd] = await Promise.all([
            fetchCSV(base + "routes.txt"),
            fetchCSV(base + "trips.txt"),
            fetchCSV(base + "stops.txt"),
            fetchCSV(base + "stop_times.txt"),
            fetchCSV(base + "calendar.txt"),
            fetchCSV(base + "calendar_dates.txt")
        ]);

        gtfs.routes = r;
        gtfs.trips = t;
        gtfs.stops = s;
        gtfs.stop_times = st;
        gtfs.calendar = c;
        gtfs.calendar_dates = cd;

        initStopSelect();
        statusArea.style.display = 'none';
        //controls.style.display = 'block';

    } catch (e) {
        statusArea.className = 'error';
        statusArea.innerText = "❌ データのロードに失敗しました。";
        console.error(e);
    }
});

function initStopSelect() {
    const stopSel = document.getElementById('departure');
    const filteredStops = gtfs.stops
        .filter(s => targetStopKeywords.some(key => s.stop_name.includes(key)))
        .reduce((acc, current) => {
            const x = acc.find(item => item.stop_name === current.stop_name);
            return !x ? acc.concat([current]) : acc;
        }, [])
        .sort((a, b) => a.stop_name.localeCompare(b.stop_name, 'ja'));

    filteredStops.forEach(s => {
        stopSel.add(new Option(s.stop_name, s.stop_name));
    });
}

document.getElementById('departure').addEventListener('change', function() {
    const stopName = this.value;
    const routeSel = document.getElementById('route');
    //const routeSel = document.getElementById('departure');
    routeSel.innerHTML = '<option value="">-- 系統を選択してください --</option>';
    if (!stopName) { routeSel.disabled = true; return; }

    const stopIds = new Set(gtfs.stops.filter(s => s.stop_name === stopName).map(s => s.stop_id));
    const tripIds = new Set(gtfs.stop_times.filter(st => stopIds.has(st.stop_id)).map(st => st.trip_id));
    const validRouteIds = new Set(gtfs.trips.filter(t => tripIds.has(t.trip_id)).map(t => t.route_id));

    const routesAtStop = gtfs.routes
        .filter(r => validRouteIds.has(r.route_id))
        .sort((a, b) => (parseInt(a.route_short_name) || 999) - (parseInt(b.route_short_name) || 999));

    routesAtStop.forEach(r => {
        const label = r.route_short_name ? `${r.route_short_name}号系統` : r.route_long_name;
        routeSel.add(new Option(label, r.route_id));
    });
    routeSel.disabled = false;
});

document.getElementById('calcBtn').addEventListener('click', () => {
    const stopName = document.getElementById('departure').value;
    const routeId = document.getElementById('route').value;
    const queue = parseInt(document.getElementById('queue').value);
    const capacity = parseInt(document.getElementById('capacity').value);
    const resDiv = document.getElementById('result');

    if (!stopName || !routeId) return;

    const now = DateTime.now();
    //console.log(now);
    const todayStr = now.toFormat('yyyyMMdd');
    const dayOfWeek = new Date().getDay(); 
    //console.log(dayOfWeek);
    //console.log(gtfs.calendar);
    // 1. 今日の service_id を抽出
    const activeServices = new Set(
        gtfs.calendar
            .filter(c => c[day_num_convert[dayOfWeek]] === "1" && todayStr >= c.start_date && todayStr <= c.end_date)    //原因はここ
            .map(c => c.service_id)
    );
    //console.log(activeServices);

    // 2. カレンダー例外の適用
    gtfs.calendar_dates.filter(cd => cd.date === todayStr).forEach(cd => {
        if (cd.exception_type === "1") activeServices.add(cd.service_id);
        if (cd.exception_type === "2") activeServices.delete(cd.service_id);
    });

    const stopIds = new Set(gtfs.stops.filter(s => s.stop_name === stopName).map(s => s.stop_id));
    const tripIds = new Set(gtfs.trips.filter(t => t.route_id === routeId && activeServices.has(t.service_id)).map(t => t.trip_id));
    
    //console.log(tripIds);

    const today0 = now.startOf('day');
    //console.log(today0);
    let upcoming = gtfs.stop_times
        .filter(st => stopIds.has(st.stop_id) && tripIds.has(st.trip_id))
        .map(st => {
            //console.log(st.trip_id);
            const arrivalSec = gtfsTimeToSeconds(st.arrival_time);
            return { time: st.arrival_time, dt: today0.plus({ seconds: arrivalSec }), ars: arrivalSec };
        })
        .filter(b => b.dt >= now)
        .sort((a, b) => a.dt - b.dt);
    //console.log(upcoming);

    // 重複時刻のバスを排除
    //console.log(upcoming);
    upcoming = upcoming.filter((v, i, a) => a.findIndex(t => t.time === v.time) === i);

    document.getElementById("result_box").style.display = "block";

    if (upcoming.length === 0) {
        //resDiv.style.backgroundColor = "#fff3cd";
        resDiv.innerHTML = "本日の運行は終了しました。";
        return;
    }

    // --- 修正版ロジック：First-In, First-Out (割り込みなし) ---
    // 「あなたの順番」は、前にいる人数 + 自分(1人)
    const yourPosition = queue + 1;
    let targetBusIndex = -1;

    for (let i = 0; i < upcoming.length; i++) {
        // i+1台目までの合計定員が、自分の順番をカバーできるか
        if ((i + 1) * capacity >= yourPosition) {
            targetBusIndex = i;
            break;
        }
    }

    if (targetBusIndex === -1) {
        resDiv.style.backgroundColor = "#f8d7da";
        resDiv.innerHTML = `非常に長い行列です。直近の ${upcoming.length} 便には乗り切れない可能性があります。`;
    } else {
        const targetBus = upcoming[targetBusIndex];
        const waitMin = Math.round(targetBus.dt.diff(now, 'minutes').minutes);
        //resDiv.style.backgroundColor = "#e6f4ea";
        resDiv.innerHTML = `
            <div class = "bus-result-message">
            あなたは <div class = "highlight-buses"><span class="circle-placeholder">${targetBusIndex + 1}</span> 台目</b> のバスに乗れる見込みです。</div><br>
            <div class="estimated-time">到着予定: ${targetBus.time} (約 <b>${waitMin} 分後)</div><br>
            <small>※あなたの位置: ${yourPosition}番目 / バス1台の空き: ${capacity}名</small>
            </div>
        `;

    }
});
*/
// もうGTFSをブラウザでパースしないので、Papa / Luxon は不要です。

// 今回対象とした15駅のリスト
// 今回対象とした15駅のリスト
const STATIONS = [
    "京都駅前", "五条坂", "清水道", "四条河原町", "四条烏丸", "四条大宮",
    "西ノ京円町", "銀閣寺道", "金閣寺道", "百万遍", "北大路バスターミナル",
    "国際会館駅", "烏丸今出川", "出町柳駅", "北野天満宮"
];

let currentStationData = []; // 読み込んだJSONデータを一時保存する変数

document.addEventListener("DOMContentLoaded", () => {
    // 画面に「検索フォーム」があるか「戻るボタン」があるかでページ判定
    const isSearchPage = document.getElementById("searchForm") !== null;

    if (isSearchPage) {
        initSearchPage();
    } else {
        initResultPage();
    }
});

// ==========================================
// 1. 検索画面 (bus_wait.html) 用の処理
// ==========================================
function initSearchPage() {
    const stopSel = document.getElementById("departure");
    const routeSel = document.getElementById("route");
    const destSel = document.getElementById("destination");
    const statusArea = document.getElementById("status-area");
    const searchForm = document.getElementById("searchForm");

    // 出発停留所の選択肢を作成
    STATIONS.forEach(st => stopSel.add(new Option(st, st)));

    // 【1段階目】停留所が選ばれたら、JSONを読み込んで「系統リスト」を作る
    stopSel.addEventListener("change", async function() {
        const station = this.value;
        
        // 系統と行き先をリセット
        routeSel.innerHTML = '<option value="">-- 系統を選択してください --</option>';
        routeSel.disabled = true;
        destSel.innerHTML = '<option value="">-- 先に系統を選んでください --</option>';
        destSel.disabled = true;
        
        if (!station) return;

        statusArea.style.display = "block";
        statusArea.innerText = "路線データを読み込み中...";

        try {
            // JSONファイルを読み込んで変数に保存
            const res = await fetch(`station_lists/${station}.json`);
            if (!res.ok) throw new Error("JSONファイルの読み込みに失敗しました");
            currentStationData = await res.json();

            // 「系統」だけを重複なしで抽出してソート
            const uniqueRoutes = [...new Set(currentStationData.map(bus => bus['系統']))].sort();

            // 系統セレクトボックスに項目を追加
            uniqueRoutes.forEach(route => {
                routeSel.add(new Option(route, route));
            });

            routeSel.disabled = false;
            statusArea.style.display = "none";
        } catch (e) {
            console.error(e);
            statusArea.className = "error";
            statusArea.innerText = "❌ データの読み込みに失敗しました";
        }
    });

    // 【2段階目】系統が選ばれたら、「行き先リスト」を作る
    routeSel.addEventListener("change", function() {
        const selectedRoute = this.value;
        
        // 行き先をリセット
        destSel.innerHTML = '<option value="">-- 行き先を選択してください --</option>';
        destSel.disabled = true;

        if (!selectedRoute) return;

        // 選んだ系統に該当するデータだけを絞り込み、「行き先」を重複なしで抽出してソート
        const targetBuses = currentStationData.filter(bus => bus['系統'] === selectedRoute);
        const uniqueDests = [...new Set(targetBuses.map(bus => bus['行き先']))].sort();

        // 行き先セレクトボックスに項目を追加
        uniqueDests.forEach(dest => {
            destSel.add(new Option(dest, dest));
        });

        destSel.disabled = false;
    });

    // 検索ボタンを押した時の処理
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        const station = stopSel.value;
        const route = routeSel.value;
        const dest = destSel.value;
        const queue = document.getElementById("queue").value;
        const capacity = document.getElementById("capacity").value;

        if (!station || !route || !dest || !queue || !capacity) return;

        // URLパラメータを作成
        const params = new URLSearchParams({
            station, route, dest, queue, capacity
        });
        
        // 結果ページへ遷移
        window.location.href = `ans_bus_wait.html?${params.toString()}`;
    });
}

// ==========================================
// 2. 結果画面 (ans_bus_wait.html) 用の処理
// ==========================================
async function initResultPage() {
    // URLからパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const station = params.get("station");
    const route = params.get("route");
    const dest = params.get("dest");
    const queue = parseInt(params.get("queue"), 10);
    const capacity = parseInt(params.get("capacity"), 10);

    // 戻るボタンの処理
    document.getElementById("backBtn").addEventListener("click", () => window.history.back());

    const resultArea = document.getElementById("resultArea");
    const timeArea = document.getElementById("timeArea");

    if (!station || !route || !dest) {
        resultArea.innerHTML = "<p>❌ 情報が不足しています</p>";
        timeArea.innerHTML = "";
        return;
    }

    // 選択された条件を画面に反映
    document.getElementById("disp-station").innerText = station;
    document.getElementById("disp-route").innerText = route;
    document.getElementById("disp-dest").innerText = dest;
    document.getElementById("disp-queue").innerText = `前に${queue}人`;
    document.getElementById("disp-capacity").innerText = `一度に${capacity}人`;

    try {
        // 対象の駅のJSONデータを取得
        const res = await fetch(`station_lists/${station}.json`);
        if (!res.ok) throw new Error("Data not found");
        const allBuses = await res.json();

        // 指定された「系統」と「行き先」に一致するバスだけを絞り込む
        const targetBuses = allBuses.filter(b => b['系統'] === route && b['行き先'] === dest);

        // 現在時刻の取得
        const now = luxon.DateTime.now().setZone('Asia/Tokyo');
        const currentTimeStr = now.toFormat("HH:mm:ss");

        // 今の時間以降に出発するバスだけを抽出
        const upcoming = targetBuses.filter(b => b['出発時間'] >= currentTimeStr);

        if (upcoming.length === 0) {
            resultArea.innerHTML = "<p>本日のこの系統の<br>運行は終了しました</p>";
            timeArea.innerHTML = "";
            return;
        }

        // 乗れるバスのインデックスを計算
        const targetIndex = Math.floor(queue / capacity);
        
        if (targetIndex >= upcoming.length) {
            resultArea.innerHTML = `<p>行列が長すぎます。<br>本日の残り便では乗れない可能性があります。</p>`;
            timeArea.innerHTML = "";
            return;
        }

        const myBus = upcoming[targetIndex];
        
        // 待ち時間の計算
        const [h, m, s] = myBus['出発時間'].split(":");
        const busTime = now.set({hour: parseInt(h, 10), minute: parseInt(m, 10), second: parseInt(s, 10)});
        const diffMin = Math.round(busTime.diff(now, 'minutes').minutes);

        // 結果を画面に出力
        resultArea.innerHTML = `
            <p>あなたが<br>乗れるバスは、</p>
            <div class="highlight-buses">
                <span class="circle-placeholder">${targetIndex}</span>
                <span class="text-suffix">本後です</span>
            </div>
        `;
        timeArea.innerHTML = `到着予定: ${myBus['出発時間']} (約 <b>${diffMin} 分後</b>)`;

    } catch (e) {
        console.error(e);
        resultArea.innerHTML = "<p>❌ 計算エラーが発生しました</p>";
        timeArea.innerHTML = "";
    }
}