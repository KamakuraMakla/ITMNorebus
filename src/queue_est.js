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