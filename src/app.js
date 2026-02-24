let currentComfortData = null;

function getComfortRate(spotName, hour) {
    const hourStr = `${hour}時`;
    if (currentComfortData && currentComfortData[spotName] && currentComfortData[spotName][hourStr] !== undefined) {
        return currentComfortData[spotName][hourStr];
    }
    return 1.0; 
}

const subwayComfortRates = {
    '京都(地下鉄)': 5, '五条(地下鉄)': 3, '四条(地下鉄)': 5, '丸太町(地下鉄)': 2, '今出川(地下鉄)': 2,
    '鞍馬口(地下鉄)': 1, '北大路(地下鉄)': 1, '北山(地下鉄)': 1, '松ヶ崎(地下鉄)': 1, '国際会館(地下鉄)': 1,
    '太秦天神川(地下鉄)': 1, '西大路御池(地下鉄)': 1, '二条(地下鉄)': 1, '二条城前(地下鉄)': 1,
    '京都市役所前(地下鉄)': 1, '三条京阪(地下鉄)': 1, '東山(地下鉄)': 1, '蹴上(地下鉄)': 1, '御陵(地下鉄)': 1
};

function getSubwayComfortRate(fromNode, toNode) {
    if (toNode === '烏丸御池(地下鉄)') {
        if (fromNode === '丸太町(地下鉄)' || fromNode === '四条(地下鉄)') return 5;
        else if (fromNode === '二条城前(地下鉄)' || fromNode === '京都市役所前(地下鉄)') return 2;
        return 5;
    }
    return subwayComfortRates[toNode] || 1.0;
}

const myGraph = {
    '京都駅前': {'五条坂': 15, '四条烏丸': 13, '京都(地下鉄)': 1, '京都駅前バス乗り場(観光地)': 0},
    '京都駅前バス乗り場(観光地)': {'京都駅前': 0},
    '五条坂': {'京都駅前': 15, '清水道': 1, '四条河原町': 11, '清水坂(観光地)': 10},
    '清水道': {'五条坂': 1, '四条河原町': 9, '東山(地下鉄)': 21, '清水坂(観光地)': 8},
    '清水坂(観光地)': {'五条坂': 10, '清水道': 8},
    '四条河原町': {'清水道': 9, '四条烏丸': 6, '出町柳駅': 20, '銀閣寺道': 22, '京都市役所前(地下鉄)': 10, '三条京阪(地下鉄)': 12, '錦市場(観光地)': 3},
    '四条烏丸': {'京都駅前': 10, '四条河原町': 5, '四条大宮': 5, '烏丸今出川': 10, '四条(地下鉄)': 3, '錦市場(観光地)': 4},
    '錦市場(観光地)': {'四条河原町': 3, '四条烏丸': 4},
    '四条大宮': {'四条烏丸': 5, '西ノ京円町': 20, '二条(地下鉄)': 15},
    '西ノ京円町': {'四条大宮': 20, '北野天満宮': 10, '金閣寺道': 10, '西大路御池(地下鉄)': 12},
    '金閣寺道': {'西ノ京円町': 10, '北野天満宮': 10, '北大路バスターミナル': 10, '金閣寺道付近(観光地)': 5},
    '金閣寺道付近(観光地)': {'金閣寺道': 5},
    '北野天満宮': {'西ノ京円町': 10, '金閣寺道': 10, '烏丸今出川': 10, '北野天満宮前付近(観光地)': 3},
    '北野天満宮前付近(観光地)': {'北野天満宮': 3},
    '北大路バスターミナル': {'金閣寺道': 10, '烏丸今出川': 10, '銀閣寺道': 20, '国際会館駅': 15, '北大路(地下鉄)': 2},
    '烏丸今出川': {'四条烏丸': 10, '北大路バスターミナル': 10, '出町柳駅': 5, '北野天満宮': 10, '今出川(地下鉄)': 2},
    '出町柳駅': {'烏丸今出川': 5, '百万遍': 5, '四条河原町': 15, '国際会館駅': 20},
    '百万遍': {'出町柳駅': 5, '銀閣寺道': 5},
    '銀閣寺道': {'百万遍': 5, '四条河原町': 25, '北大路バスターミナル': 20, '蹴上(地下鉄)': 25, '哲学の道北端(観光地)': 5},
    '哲学の道北端(観光地)': {'銀閣寺道': 5},
    '国際会館駅': {'出町柳駅': 20, '北大路バスターミナル': 15, '国際会館(地下鉄)': 2},
    '国際会館(地下鉄)': {'松ヶ崎(地下鉄)': 3, '国際会館駅': 2},
    '松ヶ崎(地下鉄)': {'国際会館(地下鉄)': 3, '北山(地下鉄)': 2},
    '北山(地下鉄)': {'松ヶ崎(地下鉄)': 2, '北大路(地下鉄)': 2},
    '北大路(地下鉄)': {'北山(地下鉄)': 2, '鞍馬口(地下鉄)': 2, '北大路バスターミナル': 2},
    '鞍馬口(地下鉄)': {'北大路(地下鉄)': 2, '今出川(地下鉄)': 2},
    '今出川(地下鉄)': {'鞍馬口(地下鉄)': 2, '丸太町(地下鉄)': 2, '烏丸今出川': 2},
    '丸太町(地下鉄)': {'今出川(地下鉄)': 2, '烏丸御池(地下鉄)': 2},
    '烏丸御池(地下鉄)': {'丸太町(地下鉄)': 2, '四条(地下鉄)': 2, '二条城前(地下鉄)': 2, '京都市役所前(地下鉄)': 2},
    '四条(地下鉄)': {'烏丸御池(地下鉄)': 2, '五条(地下鉄)': 2, '四条烏丸': 3},
    '五条(地下鉄)': {'四条(地下鉄)': 2, '京都(地下鉄)': 2},
    '京都(地下鉄)': {'五条(地下鉄)': 2, '京都駅前': 5},
    '太秦天神川(地下鉄)': {'西大路御池(地下鉄)': 2},
    '西大路御池(地下鉄)': {'太秦天神川(地下鉄)': 2, '二条(地下鉄)': 2, '西ノ京円町': 12},
    '二条(地下鉄)': {'西大路御池(地下鉄)': 2, '二条城前(地下鉄)': 2, '四条大宮': 15},
    '二条城前(地下鉄)': {'二条(地下鉄)': 2, '烏丸御池(地下鉄)': 2},
    '京都市役所前(地下鉄)': {'烏丸御池(地下鉄)': 2, '三条京阪(地下鉄)': 2, '四条河原町': 10},
    '三条京阪(地下鉄)': {'京都市役所前(地下鉄)': 2, '東山(地下鉄)': 2, '四条河原町': 12},
    '東山(地下鉄)': {'三条京阪(地下鉄)': 2, '蹴上(地下鉄)': 2, '清水道': 15},
    '蹴上(地下鉄)': {'東山(地下鉄)': 2, '御陵(地下鉄)': 2, '銀閣寺道': 25},
    '御陵(地下鉄)': {'蹴上(地下鉄)': 2}
};

const stopToAreaMap = {
    '京都駅前': '京都駅前バス乗り場', '五条坂': '清水坂', '清水道': '清水坂',
    '四条河原町': '錦市場', '四条烏丸': '錦市場', '金閣寺道': '金閣寺道付近',
    '北野天満宮': '北野天満宮前付近', '銀閣寺道': '哲学の道北端'
};

const spotStayTimeMap = {
    '京都駅前バス乗り場': 30, '北野天満宮前付近': 60, '哲学の道北端': 60,
    '清水坂': 90, '錦市場': 45, '金閣寺道付近': 60
};

function getPermutations(arr) {
    if (arr.length === 0) return [[]];
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        let rest = getPermutations(arr.slice(0, i).concat(arr.slice(i + 1)));
        for (let j = 0; j < rest.length; j++) result.push([arr[i]].concat(rest[j]));
    }
    return result;
}

class PriorityQueue {
    constructor() { this.items = []; }
    push(cost, node, actualTime) {
        this.items.push({ cost, node, actualTime });
        this.items.sort((a, b) => a.cost - b.cost);
    }
    pop() { return this.items.shift(); }
    isEmpty() { return this.items.length === 0; }
}

function padZero(num) { return String(num).padStart(2, '0'); }

function formatPath(path) {
    if (!path || path.length === 0) return [];
    const filtered = [];
    for (let i = 0; i < path.length; i++) {
        const curr = path[i], prev = i > 0 ? path[i-1] : null, next = i < path.length - 1 ? path[i+1] : null;
        if (i === 0 || i === path.length - 1 || curr.includes('(観光地)') || curr === '烏丸御池(地下鉄)') {
            filtered.push(curr); continue;
        }
        if (!curr.includes('(地下鉄)')) {
            if ((prev && !prev.includes('(地下鉄)') && !prev.includes('(観光地)')) || (next && !next.includes('(地下鉄)') && !next.includes('(観光地)'))) filtered.push(curr);
            continue;
        }
        if (!prev?.includes('(地下鉄)') || !next?.includes('(地下鉄)')) filtered.push(curr);
    }
    return filtered;
}

function calculatePathComfortSum(path, startTimeMin) {
    let currentMin = startTimeMin, totalComfort = 0;
    const karasumaNodes = ['丸太町(地下鉄)', '四条(地下鉄)'], tozaiNodes = ['二条城前(地下鉄)', '京都市役所前(地下鉄)'];
    if (!path || path.length < 2) return { totalComfort: 0 };
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i], to = path[i+1], travelTime = myGraph[from][to], hour = Math.floor(currentMin / 60) % 24;
        if (!from.includes('(地下鉄)') && !from.includes('(観光地)') && !to.includes('(地下鉄)') && !to.includes('(観光地)')) {
            const areaName = stopToAreaMap[to] || stopToAreaMap[from];
            totalComfort += travelTime * getComfortRate(areaName, hour);
        } else if (from.includes('(地下鉄)') && to.includes('(地下鉄)')) {
            totalComfort += travelTime * getSubwayComfortRate(from, to);
            if (i > 0 && from === '烏丸御池(地下鉄)') {
                const prev = path[i-1];
                if ((karasumaNodes.includes(prev) && tozaiNodes.includes(to)) || (tozaiNodes.includes(prev) && karasumaNodes.includes(to))) totalComfort += 1;
            }
        } else totalComfort += travelTime;
        currentMin += travelTime;
    }
    return { totalComfort };
}

function dijkstraComfortAware(graph, startNode, startTimeStr) {
    const [h, m] = startTimeStr.split(':').map(Number), startActualMin = h * 60 + m;
    const virtualCosts = {}, actualArrivalTimes = {}, predecessors = {};
    for (const node in graph) { virtualCosts[node] = Infinity; predecessors[node] = null; }
    virtualCosts[startNode] = 0; actualArrivalTimes[startNode] = startActualMin;
    const pq = new PriorityQueue(); pq.push(0, startNode, startActualMin);
    while (!pq.isEmpty()) {
        const { cost: currVCost, node: currNode, actualTime: currActualMin } = pq.pop();
        if (currVCost > virtualCosts[currNode]) continue;
        for (const [neighbor, travelTime] of Object.entries(graph[currNode])) {
            const hour = Math.floor(currActualMin / 60) % 24, newActual = currActualMin + travelTime;
            let addedCost = 0;
            if (!currNode.includes('(地下鉄)') && !currNode.includes('(観光地)') && !neighbor.includes('(地下鉄)') && !neighbor.includes('(観光地)')) {
                addedCost = travelTime * getComfortRate(stopToAreaMap[neighbor] || stopToAreaMap[currNode], hour);
            } else if (currNode.includes('(地下鉄)') && neighbor.includes('(地下鉄)')) {
                addedCost = travelTime * getSubwayComfortRate(currNode, neighbor);
            } else addedCost = travelTime;
            const newVCost = currVCost + addedCost;
            if (newVCost < virtualCosts[neighbor]) {
                virtualCosts[neighbor] = newVCost; actualArrivalTimes[neighbor] = newActual;
                predecessors[neighbor] = currNode; pq.push(newVCost, neighbor, newActual);
            }
        }
    }
    return { actualArrivalTimes, virtualCosts, predecessors };
}

function dijkstraStandard(graph, start) {
    const distances = {}, predecessors = {};
    for (const node in graph) { distances[node] = Infinity; predecessors[node] = null; }
    distances[start] = 0;
    const pq = new PriorityQueue(); pq.push(0, start, 0);
    while (!pq.isEmpty()) {
        const { cost: currD, node: currN } = pq.pop();
        if (currD > distances[currN]) continue;
        for (const [neighbor, weight] of Object.entries(graph[currN])) {
            if (currD + weight < distances[neighbor]) {
                distances[neighbor] = currD + weight; predecessors[neighbor] = currN;
                pq.push(distances[neighbor], neighbor, 0);
            }
        }
    }
    return { distances, predecessors };
}

function reconstructPath(predecessors, start, end) {
    const path = []; let curr = end;
    while (curr !== null) { path.push(curr); curr = predecessors[curr]; }
    path.reverse();
    return (path.length > 0 && path[0] === start) ? path : [];
}

function findOptimalTourOrder(startSpot, endSpot, viaSpots, startTimeStr) {
    const startSpotNode = `${startSpot}(観光地)`;
    let bestTotalCost = Infinity, bestTourDetails = null, bestOrder = null;
    const allPatterns = getPermutations(viaSpots);
    for (const viaOrder of allPatterns) {
        const fullOrder = [...viaOrder, endSpot];
        let currNode = startSpotNode, [h, m] = startTimeStr.split(':').map(Number), currActualMin = h * 60 + m;
        let tourCost = 0, tourDetails = [], possible = true;
        for (const targetSpot of fullOrder) {
            const targetSpotNode = `${targetSpot}(観光地)`, currTimeStr = `${padZero(Math.floor(currActualMin / 60) % 24)}:${padZero(currActualMin % 60)}`;
            const { actualArrivalTimes, virtualCosts, predecessors } = dijkstraComfortAware(myGraph, currNode, currTimeStr);
            if (virtualCosts[targetSpotNode] === Infinity) { possible = false; break; }
            const travelTime = actualArrivalTimes[targetSpotNode] - currActualMin, stayTime = (targetSpot !== endSpot) ? (spotStayTimeMap[targetSpot] || 60) : 0;
            tourDetails.push({ to_spot: targetSpot, to_stop: targetSpotNode, path: reconstructPath(predecessors, currNode, targetSpotNode), travel_time: travelTime, arrival_time: actualArrivalTimes[targetSpotNode], cost: virtualCosts[targetSpotNode], stay_time: stayTime });
            tourCost += virtualCosts[targetSpotNode]; currNode = targetSpotNode; currActualMin = actualArrivalTimes[targetSpotNode] + stayTime;
        }
        if (possible && tourCost < bestTotalCost) { bestTotalCost = tourCost; bestTourDetails = tourDetails; bestOrder = fullOrder; }
    }
    return { bestTourDetails, bestOrder };
}

function getVariableName(month, day, weather) {
    const monthMap = { 1: "jan", 2: "feb", 3: "mar", 4: "apr", 5: "may", 6: "jun", 7: "jul", 8: "aug", 9: "sep", 10: "oct", 11: "nov", 12: "dec" };
    const dayMap = { "月": "mon", "火": "tue", "水": "wed", "木": "thu", "金": "fri", "土": "sat", "日": "sun", "祝": "hol" };
    const weatherMap = { "晴れ": "sunny", "雨": "rain", "大雨": "heavyrain" };
    const name = `${monthMap[month]}_${dayMap[day]}_${weatherMap[weather]}_data`;
    return name;
}

// ============== HTML画面へ結果を描画する処理 ==============
function runTourAndRenderHTML(startSpot, endSpot, viaSpots, startTimeStr) {
    const routeContainer = document.getElementById('route-output-area');
    const diffElement = document.getElementById('total-diff');
    const detailsArea = document.getElementById('score-details-area');
    
    const { bestTourDetails: bestItineraryC, bestOrder } = findOptimalTourOrder(startSpot, endSpot, viaSpots, startTimeStr);
    
    if (!bestItineraryC) { 
        routeContainer.innerHTML = "<p class='error-message'>ルートが見つかりませんでした。</p>";
        diffElement.innerText = "0";
        if (detailsArea) detailsArea.innerHTML = "計算不能";
        return; 
    }

    const startSpotNode = `${startSpot}(観光地)`;
    const bestItineraryS = []; 
    let currNodeS = startSpotNode;
    
    for (const legC of bestItineraryC) {
        const { distances, predecessors } = dijkstraStandard(myGraph, currNodeS);
        const targetNode = `${legC.to_spot}(観光地)`;
        bestItineraryS.push({ to_spot: legC.to_spot, time: distances[targetNode], path: reconstructPath(predecessors, currNodeS, targetNode) });
        currNodeS = targetNode;
    }

    let totalComfortS = 0; // 最速ルートのスコア合計
    let totalComfortC = 0; // 快適ルートのスコア合計
    let routeHTML = "";

    bestItineraryC.forEach((legC, i) => {
        const legS = bestItineraryS[i];
        const startMin = legC.arrival_time - legC.travel_time;
        const { totalComfort: comfortS } = calculatePathComfortSum(legS.path, startMin);
        const { totalComfort: comfortC } = calculatePathComfortSum(legC.path, startMin);

        totalComfortS += comfortS;
        totalComfortC += comfortC;

        const formattedPath = formatPath(legC.path);
        
        // パスをHTMLとして生成（観光地、バス等、地下鉄の判別）
        formattedPath.forEach((node, idx) => {
            let type = "バス等";
            let typeClass = "type-bus";
            
            if (node.includes('(観光地)')) { 
                type = "観光地"; 
                typeClass = "type-tourist"; 
            } else if (node.includes('(地下鉄)')) { 
                type = "地下鉄"; 
                typeClass = "type-subway"; 
            }

            let cleanNode = node.replace('(観光地)', '').replace('(地下鉄)', '');

            routeHTML += `
            <div class="route-node">
                <span class="node-type ${typeClass}">${type}</span>
                <span class="node-name">${cleanNode}</span>
            </div>
            `;
            
            if (idx < formattedPath.length - 1) {
                routeHTML += `<div class="route-arrow">↓</div>`;
            }
        });

        // スコア差分（回避効果）の表示メッセージをルートの合間に挿入
        let diff = comfortS - comfortC;
        if (diff > 0.1) {
            routeHTML += `<div class="diff-notice">回避による軽減: ${diff.toFixed(1)} <span style="font-size: smaller; opacity: 0.8;">(最速: ${comfortS.toFixed(1)} / 回避: ${comfortC.toFixed(1)})</span></div>`;
        }

        // 次の目的地（経由地）がある場合は滞在時間を表示
        if (i < bestItineraryC.length - 1) {
             routeHTML += `<div class="route-stay">【滞在予定: ${legC.stay_time}分】</div>`;
             routeHTML += `<div class="route-arrow">↓</div>`;
        }
    });

    // 合計軽減スコアを画面に反映
    const totalDiff = Math.max(0, totalComfortS - totalComfortC);
    diffElement.innerText = totalDiff.toFixed(1);
    
    // 計算式の詳細を小さい文字で画像エリアに反映
    if (detailsArea) {
        detailsArea.innerHTML = `
            <div style="font-size: 0.85rem; line-height: 1.4; color: #ddd;">
                <div style="margin-bottom: 4px; color: #f8db70; font-weight: bold;">【混雑スコア計算式】</div>
                (最速ルート: ${totalComfortS.toFixed(1)} - 快適ルート: ${totalComfortC.toFixed(1)} = 軽減: ${totalDiff.toFixed(1)})
            </div>
        `;
    }

    // ルートHTMLを画面に反映
    routeContainer.innerHTML = routeHTML;
}

// ============== ページ読み込み時にURLパラメータを取得して自動実行 ==============
document.addEventListener('DOMContentLoaded', function() {
    // URLからパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const startSpot = params.get('departure');
    const endSpot = params.get('arrival');
    const weather = params.get('weather') || '晴れ';
    
    // パラメータがなければ実行しない
    if (!startSpot || !endSpot) return;

    // 経由地の取得
    const viaSpots = [];
    for(let [key, value] of params.entries()) {
        if(key === 'via[]' && value !== "") {
            viaSpots.push(value);
        }
    }

    // 日時の取得
    const mode = params.get('datetime_mode');
    let targetDate = new Date();
    if (mode === 'custom' && params.get('custom_datetime')) {
        targetDate = new Date(params.get('custom_datetime'));
    }
    const month = targetDate.getMonth() + 1;
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][targetDate.getDay()];
    const startTimeStr = `${padZero(targetDate.getHours())}:${padZero(targetDate.getMinutes())}`;

    // 検索条件を画面に表示
    document.getElementById('display-conditions').innerText = 
        `${month}月${targetDate.getDate()}日（${dayOfWeek}） ${startTimeStr}出発 ｜ 天気：${weather}`;

    // データの読み込み
    const varName = getVariableName(month, dayOfWeek, weather);
    try {
        currentComfortData = eval(varName);
        if (!currentComfortData) throw new Error();
    } catch (e) {
        document.getElementById('route-output-area').innerHTML = `<p class="error-message">混雑データが見つかりません。条件を変えてお試しください。</p>`;
        document.getElementById('score-details-area').innerHTML = `<span style="font-size: 0.8rem; color: #ffcccc;">データ読み込みエラー</span>`;
        return;
    }

    // 計算と描画の実行
    runTourAndRenderHTML(startSpot, endSpot, viaSpots, startTimeStr);
});