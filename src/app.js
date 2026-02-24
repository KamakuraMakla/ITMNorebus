let currentComfortData = null;


const uiToDataNameMap = {
    '京都駅': '京都駅前バス乗り場',
    '清水寺': '清水坂',
    '錦市場': '錦市場',
    '金閣寺': '金閣寺道付近',
    '北野天満宮': '北野天満宮前付近',
    '哲学の道': '哲学の道北端'
};

function getComfortRate(spotName, hour) {

    const dataSpotName = uiToDataNameMap[spotName] || spotName; 
    const hourStr = `${hour}時`;
    if (currentComfortData && currentComfortData[dataSpotName] && currentComfortData[dataSpotName][hourStr] !== undefined) {
        return currentComfortData[dataSpotName][hourStr];
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
    '京都駅前': {'五条坂': 15, '四条河原町': 13, '四条烏丸': 11, '四条大宮': 13, '北野天満宮前': 33, '西大路御池': 29, '京都(地下鉄)': 1, '京都駅(観光地)': 1},
    '五条坂': {'京都駅前': 15, '清水道': 1, '銀閣寺道': 24, '清水寺(観光地)': 9},
    '清水道': {'五条坂': 1, '四条河原町': 9, '銀閣寺道': 15, '東山三条': 8, '三条京阪前': 11, '東山(地下鉄)': 20, '清水寺(観光地)': 8},
    '四条河原町': {'京都駅前': 13, '清水道': 9, '四条烏丸': 6, '北大路バスターミナル': 26, '出町柳駅前': 14, '烏丸丸太町': 10, '東山三条': 9, '三条京阪前': 5, '京都市役所前(地下鉄)': 12, '三条京阪(地下鉄)': 15, '錦市場(観光地)': 6},
    '四条烏丸': {'京都駅前': 11, '四条河原町': 6, '四条大宮': 6, '金閣寺道': 30, '烏丸丸太町': 6, '四条(地下鉄)': 1, '錦市場(観光地)': 9},
    '四条大宮': {'京都駅前': 13, '四条烏丸': 6, '二条駅前': 5, '西大路御池': 11, '二条(地下鉄)': 6},
    '西ノ京円町': {'烏丸丸太町': 12, '二条駅前': 8, '西大路御池': 4, '北野白梅町': 4, '西大路御池(地下鉄)': 11},
    '銀閣寺道': {'五条坂': 24, '清水道': 15, '百万遍': 6, '北大路バスターミナル': 23, '国際会館駅前': 18, '烏丸丸太町': 16, '哲学の道(観光地)': 15},
    '金閣寺道': {'四条烏丸': 30, '北大路バスターミナル': 11, '烏丸今出川': 17, '北野白梅町': 5, '金閣寺(観光地)': 8},
    '百万遍': {'銀閣寺道': 6, '北大路バスターミナル': 19, '国際会館駅前': 23, '出町柳駅前': 2, '烏丸丸太町': 12, '東山三条': 9},
    '北大路バスターミナル': {'四条河原町': 26, '銀閣寺道': 23, '金閣寺道': 11, '百万遍': 19, '出町柳駅前': 14, '三条京阪前': 27, '二条駅前': 24, '北大路(地下鉄)': 2},
    '国際会館駅前': {'銀閣寺道': 18, '百万遍': 23, '国際会館(地下鉄)': 1},
    '烏丸今出川': {'金閣寺道': 17, '出町柳駅前': 6, '北野天満宮前': 11, '烏丸丸太町': 5, '三条京阪前': 18, '二条駅前': 17, '今出川(地下鉄)': 1},
    '出町柳駅前': {'四条河原町': 14, '百万遍': 2, '北大路バスターミナル': 14, '烏丸今出川': 6},
    '北野天満宮前': {'京都駅前': 33, '烏丸今出川': 11, '烏丸丸太町': 17, '二条駅前': 11, '北野白梅町': 1, '北野天満宮(観光地)': 3},
    '烏丸丸太町': {'四条河原町': 10, '四条烏丸': 6, '西ノ京円町': 12, '銀閣寺道': 16, '百万遍': 12, '烏丸今出川': 5, '北野天満宮前': 17, '東山三条': 11, '三条京阪前': 13, '丸太町(地下鉄)': 1},
    '東山三条': {'清水道': 8, '四条河原町': 9, '百万遍': 9, '烏丸丸太町': 11, '三条京阪前': 3, '東山(地下鉄)': 2},
    '三条京阪前': {'清水道': 11, '四カラー': 5, '北大路バスターミナル': 27, '烏丸今出川': 18, '烏丸丸太町': 13, '東山三条': 3, '二条駅前': 18, '三条京阪(地下鉄)': 1},
    '二条駅前': {'四条大宮': 5, '西ノ京円町': 8, '北大路バスターミナル': 24, '烏丸今出川': 17, '北野天満宮前': 11, '三条京阪前': 18, '二条(地下鉄)': 3},
    '西大路御池': {'京都駅前': 29, '四条大宮': 11, '西ノ京円町': 4, '西大路御池(地下鉄)': 1},
    '北野白梅町': {'西ノ京円町': 4, '金閣寺道': 5, '北野天満宮前': 1, '北野天満宮(観光地)': 8},
    '京都駅(観光地)': {'京都駅前': 1, '京都(地下鉄)': 0},
    '清水寺(観光地)': {'五条坂': 9, '清水道': 8},
    '錦市場(観光地)': {'四条河原町': 6, '四条烏丸': 9, '四条(地下鉄)': 8},
    '金閣寺(観光地)': {'金閣寺道': 8},
    '北野天満宮(観光地)': {'北野天満宮前': 3, '北野白梅町': 8},
    '哲学の道(観光地)': {'銀閣寺道': 15},
    '国際会館(地下鉄)': {'松ヶ崎(地下鉄)': 2, '国際会館駅前': 1},
    '松ヶ崎(地下鉄)': {'国際会館(地下鉄)': 2, '北山(地下鉄)': 2},
    '北山(地下鉄)': {'松ヶ崎(地下鉄)': 2, '北大路(地下鉄)': 2},
    '北大路(地下鉄)': {'北山(地下鉄)': 2, '鞍馬口(地下鉄)': 2, '北大路バスターミナル': 2},
    '鞍馬口(地下鉄)': {'北大路(地下鉄)': 2, '今出川(地下鉄)': 2},
    '今出川(地下鉄)': {'鞍馬口(地下鉄)': 2, '丸太町(地下鉄)': 2, '烏丸今出川': 1},
    '丸太町(地下鉄)': {'今出川(地下鉄)': 2, '烏丸御池(地下鉄)': 2, '烏丸丸太町': 1},
    '烏丸御池(地下鉄)': {'丸太町(地下鉄)': 2, '四条(地下鉄)': 2, '二条城前(地下鉄)': 2, '京都市役所前(地下鉄)': 2},
    '四条(地下鉄)': {'烏丸御池(地下鉄)': 2, '五条(地下鉄)': 2, '四条烏丸': 1, '錦市場(観光地)': 8},
    '五条(地下鉄)': {'四条(地下鉄)': 2, '京都(地下鉄)': 2},
    '京都(地下鉄)': {'五条(地下鉄)': 2, '京都駅前': 1, '京都駅(観光地)': 0},
    '太秦天神川(地下鉄)': {'西大路御池(地下鉄)': 2},
    '西大路御池(地下鉄)': {'太秦天神川(地下鉄)': 2, '二条(地下鉄)': 2, '西ノ京円町': 11, '西大路御池': 1},
    '二条(地下鉄)': {'西大路御池(地下鉄)': 2, '二条城前(地下鉄)': 2, '四条大宮': 6, '二条駅前': 3},
    '二条城前(地下鉄)': {'二条(地下鉄)': 2, '烏丸御池(地下鉄)': 2},
    '京都市役所前(地下鉄)': {'烏丸御池(地下鉄)': 2, '三条京阪(地下鉄)': 1, '四条河原町': 12},
    '三条京阪(地下鉄)': {'京都市役所前(地下鉄)': 1, '東山(地下鉄)': 2, '四条河原町': 15, '三条京阪前': 1},
    '東山(地下鉄)': {'三条京阪(地下鉄)': 2, '蹴上(地下鉄)': 2, '清水道': 20, '東山三条': 2},
    '蹴上(地下鉄)': {'東山(地下鉄)': 2, '御陵(地下鉄)': 3},
    '御陵(地下鉄)': {'蹴上(地下鉄)': 3}
};

const stopToAreaMap = {
    '京都駅前': '京都駅', '五条坂': '清水寺', '清水道': '清水寺',
    '四条河原町': '錦市場', '四条烏丸': '錦市場', '金閣寺道': '金閣寺',
    '北野天満宮前': '北野天満宮', '銀閣寺道': '哲学の道'
};

const spotStayTimeMap = {
    '京都駅': 0, '北野天満宮': 50, '哲学の道': 30,
    '清水寺': 75, '錦市場': 75, '金閣寺': 40
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
    if (!path || path.length < 2) return { totalComfort: 0 };
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i], to = path[i+1], travelTime = myGraph[from][to], hour = Math.floor(currentMin / 60) % 24;
        if (!from.includes('(地下鉄)') && !from.includes('(観光地)') && !to.includes('(地下鉄)') && !to.includes('(観光地)')) {
            const areaName = stopToAreaMap[to] || stopToAreaMap[from];
            totalComfort += travelTime * getComfortRate(areaName, hour);
        } else if (from.includes('(地下鉄)') && to.includes('(地下鉄)')) {
            totalComfort += travelTime * getSubwayComfortRate(from, to);
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
    const dayMap = { "日": "sun", "月": "mon", "火": "tue", "水": "wed", "木": "thu", "金": "fri", "土": "sat", "祝": "hol" };
    const weatherMap = { "晴れ": "sunny", "雨": "rainy", "大雨": "heavyrain" };
    const name = `${monthMap[month]}_${dayMap[day]}_${weatherMap[weather]}_data`;
    return name;
}

function runTourAndRenderHTML(startSpot, endSpot, viaSpots, startTimeStr) {
    const routeContainer = document.getElementById('route-output-area');
    const diffElement = document.getElementById('total-diff');
    const detailsArea = document.getElementById('score-details-area');
    const { bestTourDetails: bestItineraryC, bestOrder } = findOptimalTourOrder(startSpot, endSpot, viaSpots, startTimeStr);
    if (!bestItineraryC) { 
        routeContainer.innerHTML = "<p class='error-message'>ルートが見つかりませんでした。</p>";
        diffElement.innerText = "0";
        return; 
    }
    const startSpotNode = `${startSpot}(観光地)`;
    const bestItineraryS = []; let currNodeS = startSpotNode;
    for (const legC of bestItineraryC) {
        const { distances, predecessors } = dijkstraStandard(myGraph, currNodeS);
        const targetNode = `${legC.to_spot}(観光地)`;
        bestItineraryS.push({ to_spot: legC.to_spot, time: distances[targetNode], path: reconstructPath(predecessors, currNodeS, targetNode) });
        currNodeS = targetNode;
    }
    let totalComfortS = 0; let totalComfortC = 0; let routeHTML = "";
    bestItineraryC.forEach((legC, i) => {
        const legS = bestItineraryS[i];
        const startMin = legC.arrival_time - legC.travel_time;
        const { totalComfort: comfortS } = calculatePathComfortSum(legS.path, startMin);
        const { totalComfort: comfortC } = calculatePathComfortSum(legC.path, startMin);
        totalComfortS += comfortS; totalComfortC += comfortC;
        const formattedPath = formatPath(legC.path);
        let minorGroup = [];
        formattedPath.forEach((node, idx) => {
            const isTourist = node.includes('(観光地)');
            if (isTourist) {
                if (minorGroup.length > 0) {
                    routeHTML += `<div class="minor-nodes-wrapper"><details><summary>${minorGroup.length}件の経由地を表示</summary>`;
                    minorGroup.forEach((mNode, mIdx) => {
                        routeHTML += renderNode(mNode, false); 
                        if (mIdx < minorGroup.length - 1) routeHTML += `<div class="route-arrow">↓</div>`;
                    });
                    routeHTML += `</details></div><div class="route-arrow">↓</div>`;
                    minorGroup = [];
                }
                routeHTML += renderNode(node, true);
                if (idx < formattedPath.length - 1) routeHTML += `<div class="route-arrow">↓</div>`;
            } else { minorGroup.push(node); }
        });
        if (minorGroup.length > 0) {
            routeHTML += `<div class="minor-nodes-wrapper"><details><summary>${minorGroup.length}件の経由地を表示</summary>`;
            minorGroup.forEach((mNode, mIdx) => {
                routeHTML += renderNode(mNode, false);
                if (mIdx < minorGroup.length - 1) routeHTML += `<div class="route-arrow">↓</div>`;
            });
            routeHTML += `</details></div>`;
        }
        let diff = comfortS - comfortC;
        if (diff > 0.1) {
            routeHTML += `<div class="diff-notice">回避による軽減: ${diff.toFixed(1)} <span style="font-size: smaller; opacity: 0.8;">(最速: ${comfortS.toFixed(1)} / 回避: ${comfortC.toFixed(1)})</span></div>`;
        }
        if (i < bestItineraryC.length - 1) {
             routeHTML += `<div class="route-stay">【滞在予定: ${legC.stay_time}分】</div><div class="route-arrow">↓</div>`;
        }
    });
    const totalDiff = Math.max(0, totalComfortS - totalComfortC);
    diffElement.innerText = totalDiff.toFixed(1);
    if (detailsArea) {
        detailsArea.innerHTML = `<div style="font-size: 0.85rem; line-height: 1.4; color: #ddd;"><div style="margin-bottom: 4px; color: #f8db70; font-weight: bold;">【混雑スコア計算式】</div>(最速ルート: ${totalComfortS.toFixed(1)} - 快適ルート: ${totalComfortC.toFixed(1)} = 軽減: ${totalDiff.toFixed(1)})</div>`;
    }
    routeContainer.innerHTML = routeHTML;
}

function renderNode(node, isTourist) {
    let type = "バス等"; let typeClass = "type-bus";
    let fontSize = isTourist ? "1.15rem" : "0.85rem"; let fontWeight = isTourist ? "bold" : "normal";
    if (node.includes('(観光地)')) { type = "観光地"; typeClass = "type-tourist"; }
    else if (node.includes('(地下鉄)')) { type = "地下鉄"; typeClass = "type-subway"; }
    let cleanNode = node.replace('(観光地)', '').replace('(地下鉄)', '');
    return `<div class="route-node" style="opacity: ${isTourist ? "1.0" : "0.8"};"><span class="node-type ${typeClass}">${type}</span><span class="node-name" style="font-size: ${fontSize}; font-weight: ${fontWeight};">${cleanNode}</span></div>`;
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const startSpot = params.get('departure');
    const endSpot = params.get('arrival');
    const weather = params.get('weather') || '晴れ';
    if (!startSpot || !endSpot) return;
    const viaSpots = [];
    for(let [key, value] of params.entries()) { if(key === 'via[]' && value !== "") viaSpots.push(value); }
    const mode = params.get('datetime_mode');
    let targetDate = new Date();
    if (mode === 'custom' && params.get('custom_datetime')) targetDate = new Date(params.get('custom_datetime'));
    const month = targetDate.getMonth() + 1;
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][targetDate.getDay()];
    const startTimeStr = `${padZero(targetDate.getHours())}:${padZero(targetDate.getMinutes())}`;
    document.getElementById('display-conditions').innerText = `${month}月${targetDate.getDate()}日（${dayOfWeek}） ${startTimeStr}出発 ｜ 天気：${weather}`;
    const varName = getVariableName(month, dayOfWeek, weather);
    try {
        currentComfortData = eval(varName);
        if (!currentComfortData) throw new Error();
    } catch (e) {
        document.getElementById('route-output-area').innerHTML = `<p class="error-message">混雑データが見つかりません。条件を変えてお試しください。</p>`;
        return;
    }
    runTourAndRenderHTML(startSpot, endSpot, viaSpots, startTimeStr);
});