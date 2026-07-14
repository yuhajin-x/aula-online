let coins = Number(localStorage.getItem("coins")) || 100;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let rollCount = Number(localStorage.getItem("rollCount")) || 0;
let attackPower = Number(localStorage.getItem("attackPower")) || 10;
let luckLevel = Number(localStorage.getItem("luckLevel")) || 0;

let currentMonster = null;
let maxMonsterHp = 0;
let autoRollInterval = null;

// 희귀한 순서대로 정렬 (배열 순서 = 검사 순서, 위에서부터 먼저 당첨되면 즉시 확정)
const auras = [
    { name: "신성",       chance: 10000000000 },
    { name: "울트라티어", chance: 1000000 },
    { name: "엔딩티어",   chance: 100000 },
    { name: "초월전설",   chance: 10000 },
    { name: "전설",       chance: 100 },
    { name: "울트라 에픽", chance: 40 },
    { name: "에픽",       chance: 30 },
    { name: "울트라 레어", chance: 25 },
    { name: "레어",       chance: 15 },
    { name: "고급",       chance: 3 },
    { name: "일반",       chance: 2 }
];

// 도감 표시 순서 (흔한 것부터)
const allAuras = [
    "일반", "고급", "레어", "울트라 레어", "에픽", "울트라 에픽",
    "전설", "초월전설", "엔딩티어", "울트라티어", "신성"
];

// 오라 등급별 공격력 보너스
const AURA_ATK_BONUS = {
    "일반": 0,
    "고급": 2,
    "레어": 5,
    "울트라 레어": 15,
    "에픽": 30,
    "울트라 에픽": 75,
    "전설": 200,
    "초월전설": 1000,
    "엔딩티어": 5000,
    "울트라티어": 20000,
    "신성": 100000
};

// allAuras 순서를 등급 순위로 사용 (인벤토리 중 최고 등급 찾기용)
const AURA_RANK = {};
allAuras.forEach((name, i) => { AURA_RANK[name] = i; });

const monsters = [
    { name: "슬라임", hp: 10, coin: 5 },
    { name: "고블린", hp: 30, coin: 15 },
    { name: "오크", hp: 80, coin: 50 },
    { name: "드래곤", hp: 500, coin: 500 },
    { name: "신성한 용", hp: 5000, coin: 5000 }
];

/* ===================== 저장 ===================== */
function saveData() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("favorites", JSON.stringify(favorites));
    localStorage.setItem("rollCount", rollCount);
    localStorage.setItem("coins", coins);
    localStorage.setItem("attackPower", attackPower);
    localStorage.setItem("luckLevel", luckLevel);
}

/* ===================== 가챠 ===================== */
function getAura() {
    // 희귀한 것부터 검사 -> 당첨되는 즉시 반환 (덮어쓰기 버그 방지)
    for (const aura of auras) {
        if (Math.floor(Math.random() * aura.chance) === 0) {
            return aura.name;
        }
    }
    return "일반";
}

function roll(amount) {
    let cost = 0;
    if (amount === 1) cost = 10;
    else if (amount === 15) cost = 50;
    else if (amount === 30) cost = 300;

    if (coins < cost) {
        alert("코인이 부족합니다!");
        return;
    }

    coins -= cost;
    document.getElementById("coins").textContent = coins;

    for (let i = 0; i < amount; i++) {
        const aura = getAura();
        inventory.push(aura);
        rollCount++;

        const currentAura = document.getElementById("currentAura");
        currentAura.textContent = aura;
        currentAura.style.color = getAuraColor(aura);
        currentAura.style.fontWeight = "bold";

        if (aura === "신성") {
            flashScreen("gold");
            alert("🌟 신성을 획득했습니다! 🌟");
        } else if (aura === "울트라티어") {
            flashScreen("cyan");
            alert("💎 울트라티어 획득!");
        } else if (aura === "엔딩티어") {
            flashScreen("purple");
            alert("🔥 엔딩티어 획득!");
        }

        document.getElementById("rollCount").textContent = rollCount;
    }

    saveData();
    renderInventory();
    renderCollection();
}

function startAutoRoll() {
    if (autoRollInterval) return;
    autoRollInterval = setInterval(() => {
        roll(1);
    }, 1000);
}

function stopAutoRoll() {
    clearInterval(autoRollInterval);
    autoRollInterval = null;
}

/* ===================== 인벤토리 / 도감 ===================== */
function renderInventory() {
    const list = document.getElementById("inventory");
    list.innerHTML = "";

    const counts = {};
    inventory.forEach(aura => {
        counts[aura] = (counts[aura] || 0) + 1;
    });

    Object.keys(counts).forEach(aura => {
        const li = document.createElement("li");
        li.textContent = `${aura} x${counts[aura]}`;
        li.onclick = () => addFavorite(aura);
        li.style.color = getAuraColor(aura);
        li.style.fontWeight = "bold";
        list.appendChild(li);
    });
}

function renderCollection() {
    const collection = document.getElementById("collection");
    collection.innerHTML = "";

    allAuras.forEach(aura => {
        const li = document.createElement("li");
        if (inventory.includes(aura)) {
            li.textContent = "✅ " + aura;
            li.style.color = getAuraColor(aura);
        } else {
            li.textContent = "❌ ???";
        }
        collection.appendChild(li);
    });
}

function addFavorite(aura) {
    if (!aura || aura === "없음") return;
    if (!favorites.includes(aura)) {
        favorites.push(aura);
        saveData();
        renderFavorites();
    }
}

function renderFavorites() {
    const list = document.getElementById("favoriteList");
    list.innerHTML = "";

    favorites.forEach(aura => {
        const li = document.createElement("li");
        li.textContent = aura;
        li.style.color = getAuraColor(aura);
        list.appendChild(li);
    });
}

function getAuraColor(aura) {
    switch (aura) {
        case "일반": return "white";
        case "고급": return "lime";
        case "레어": return "deepskyblue";
        case "울트라 레어": return "violet";
        case "에픽": return "orange";
        case "울트라 에픽": return "red";
        case "전설": return "gold";
        case "초월전설": return "cyan";
        case "엔딩티어": return "#ff44ff";
        case "울트라티어": return "#00ffff";
        case "신성": return "#ffff00";
        default: return "white";
    }
}

function flashScreen(color) {
    document.body.style.background = color;
    setTimeout(() => {
        document.body.style.background = "#111";
    }, 1000);
}

// 보유한 오라 중 가장 높은 등급의 공격력 보너스를 반환 (새로고침해도 유지됨)
function getBestAuraBonus() {
    let bestRank = -1;
    let bestName = null;

    inventory.forEach(aura => {
        const rank = AURA_RANK[aura];
        if (rank !== undefined && rank > bestRank) {
            bestRank = rank;
            bestName = aura;
        }
    });

    return bestName ? AURA_ATK_BONUS[bestName] : 0;
}

/* ===================== 몬스터 / 전투 ===================== */
function spawnMonster() {
    selectMonster();
}

function selectMonster() {
    const index = document.getElementById("monsterSelect").value;
    currentMonster = { ...monsters[index] };
    maxMonsterHp = currentMonster.hp;

    document.getElementById("monsterName").textContent = currentMonster.name;
    document.getElementById("monsterHp").textContent = currentMonster.hp;
    document.getElementById("hpBar").style.width = "100%";
}

function attackMonster() {
    if (!currentMonster) {
        spawnMonster();
        return;
    }

    let damage = attackPower + getBestAuraBonus();

    let critChance = 0.1 + (luckLevel * 0.01);
    if (Math.random() < critChance) {
        damage *= 2;
        alert("💥 크리티컬!");
    }

    currentMonster.hp -= damage;
    if (currentMonster.hp < 0) currentMonster.hp = 0;

    const hpPercent = (currentMonster.hp / maxMonsterHp) * 100;
    document.getElementById("hpBar").style.width = hpPercent + "%";
    document.getElementById("monsterHp").textContent = currentMonster.hp;

    const monsterName = document.getElementById("monsterName");
    monsterName.classList.add("hit");
    setTimeout(() => monsterName.classList.remove("hit"), 300);

    if (currentMonster.hp <= 0) {
        defeatMonster(currentMonster);
        spawnMonster();
    }
}

function defeatMonster(monster) {
    coins += monster.coin;
    alert(monster.name + " 처치!\n+" + monster.coin + " 코인 획득!");

    saveData();
    document.getElementById("coins").textContent = coins;
}

/* ===================== 상점 ===================== */
function upgradeAttack() {
    if (coins < 100) {
        alert("코인이 부족합니다!");
        return;
    }
    coins -= 100;
    attackPower += 5;

    saveData();
    document.getElementById("coins").textContent = coins;
    document.getElementById("attackPower").textContent = attackPower;
}

function upgradeLuck() {
    if (coins < 200) {
        alert("코인이 부족합니다!");
        return;
    }
    coins -= 200;
    luckLevel++;

    saveData();
    document.getElementById("coins").textContent = coins;
    document.getElementById("luckLevel").textContent = luckLevel;
}

/* ===================== 초기화 ===================== */
function init() {
    document.getElementById("rollCount").textContent = rollCount;
    document.getElementById("coins").textContent = coins;
    document.getElementById("attackPower").textContent = attackPower;
    document.getElementById("luckLevel").textContent = luckLevel;

    renderInventory();
    renderCollection();
    renderFavorites();
    spawnMonster();
}

init();
