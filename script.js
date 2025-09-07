let trades = JSON.parse(localStorage.getItem("trades")) || [
  {date: "2025-09-01", pair: "BTC/USDT", position: "Buy", lot: 0.5, result: 500},
  {date: "2025-09-02", pair: "ETH/USDT", position: "Sell", lot: 1, result: 200},
  {date: "2025-09-03", pair: "XAU/USD", position: "Buy", lot: 0.2, result: -100}
];

let initialBalance = parseFloat(localStorage.getItem("initialBalance")) || 1000;

// Ambil filter
function getFilteredTrades() {
  const filter = document.getElementById("filterSelect").value;
  const today = new Date();
  return trades.filter(t => {
    const tradeDate = new Date(t.date);
    if (filter === "today") {
      return tradeDate.toDateString() === today.toDateString();
    }
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return tradeDate >= weekAgo && tradeDate <= today;
    }
    if (filter === "month") {
      return tradeDate.getMonth() === today.getMonth() &&
             tradeDate.getFullYear() === today.getFullYear();
    }
    return true; // all
  });
}

function renderTable() {
  const tbody = document.querySelector("#tradeTable tbody");
  tbody.innerHTML = "";
  const filteredTrades = getFilteredTrades();

  filteredTrades.forEach((t, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>${t.pair}</td>
        <td>${t.position}</td>
        <td>${t.lot}</td>
        <td>${t.result > 0 ? "+ $" + t.result : "- $" + Math.abs(t.result)}</td>
        <td>
          <button class="btn small" onclick="editTrade(${index})">✏️ Edit</button>
          <button class="btn small danger" onclick="deleteTrade(${index})">🗑️ Hapus</button>
        </td>
      </tr>
    `;
  });

  updateDashboard(filteredTrades);
  updateChart(filteredTrades);
}

function saveTrade() {
  const date = document.getElementById("dateInput").value;
  const pair = document.getElementById("pairInput").value;
  const position = document.getElementById("positionInput").value;
  const lot = parseFloat(document.getElementById("lotInput").value);
  const result = parseFloat(document.getElementById("resultInput").value);
  const editIndex = document.getElementById("editIndex").value;

  if (!date || !pair || isNaN(lot) || isNaN(result)) {
    alert("Harap isi semua field!");
    return;
  }

  const tradeData = {date, pair, position, lot, result};

  if (editIndex === "") {
    trades.push(tradeData);
  } else {
    trades[editIndex] = tradeData;
    document.getElementById("formTitle").innerText = "➕ Tambah Catatan Trading";
    document.querySelector(".cancel").style.display = "none";
  }

  localStorage.setItem("trades", JSON.stringify(trades));
  resetForm();
  renderTable();
}

function editTrade(index) {
  const trade = trades[index];
  document.getElementById("dateInput").value = trade.date;
  document.getElementById("pairInput").value = trade.pair;
  document.getElementById("positionInput").value = trade.position;
  document.getElementById("lotInput").value = trade.lot;
  document.getElementById("resultInput").value = trade.result;
  document.getElementById("editIndex").value = index;

  document.getElementById("formTitle").innerText = "✏️ Edit Catatan Trading";
  document.querySelector(".cancel").style.display = "inline-block";
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  document.getElementById("dateInput").value = "";
  document.getElementById("pairInput").value = "";
  document.getElementById("positionInput").value = "Buy";
  document.getElementById("lotInput").value = "";
  document.getElementById("resultInput").value = "";
  document.getElementById("editIndex").value = "";
  document.getElementById("formTitle").innerText = "➕ Tambah Catatan Trading";
  document.querySelector(".cancel").style.display = "none";
}

function deleteTrade(index) {
  if (confirm("Yakin ingin menghapus catatan ini?")) {
    trades.splice(index, 1);
    localStorage.setItem("trades", JSON.stringify(trades));
    renderTable();
  }
}

function updateDashboard(filteredTrades) {
  const currentBalance = filteredTrades.reduce((acc, t) => acc + t.result, initialBalance);
  const totalProfit = currentBalance - initialBalance;
  const wins = filteredTrades.filter(t => t.result > 0).length;
  const winrate = filteredTrades.length > 0 ? Math.round((wins / filteredTrades.length) * 100) : 0;

  document.getElementById("initialBalance").innerText = `$${initialBalance}`;
  document.getElementById("currentBalance").innerText = `$${currentBalance}`;
  document.getElementById("totalProfit").innerText = `${totalProfit >= 0 ? "+ $" + totalProfit : "- $" + Math.abs(totalProfit)}`;
  document.getElementById("winrate").innerText = `${winrate}%`;
}

// Modal awal edit
function editModal() {
  const newModal = prompt("Masukkan modal awal baru:", initialBalance);
  if (newModal !== null && !isNaN(newModal)) {
    initialBalance = parseFloat(newModal);
    localStorage.setItem("initialBalance", initialBalance);
    renderTable();
  }
}

// Chart
const ctx = document.getElementById('profitChart').getContext('2d');
let chart = new Chart(ctx, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Saldo ($)', data: [], borderColor: '#b3ff00', backgroundColor: 'rgba(179,255,0,0.2)', fill: true, tension: 0.3 }] },
  options: { plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } } }
});

function updateChart(filteredTrades) {
  chart.data.labels = filteredTrades.map(t => t.date);
  chart.data.datasets[0].data = filteredTrades.reduce((acc, t, i) => {
    let last = acc[i-1] || initialBalance;
    acc.push(last + t.result);
    return acc;
  }, []);
  chart.update();
}

// --- Burger menu toggle (mobile) ---
document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('burgerBtn');
  const menu = document.getElementById('navMenu');
  if (!burger || !menu) return;

  const toggle = () => {
    menu.classList.toggle('show');
    burger.setAttribute(
      'aria-expanded',
      menu.classList.contains('show') ? 'true' : 'false'
    );
  };

  burger.addEventListener('click', toggle);

  // Tutup menu setelah klik link / pilih filter
  menu.querySelectorAll('a').forEach(el => {
    el.addEventListener('click', () => {
      menu.classList.remove('show');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
});


renderTable();

// Event listener supaya filter langsung jalan
document.getElementById("filterSelect").addEventListener("change", renderTable);
