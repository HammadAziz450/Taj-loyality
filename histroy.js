// LOAD HISTORY PAGE
function renderHistoryPage() {
    let activity = JSON.parse(localStorage.getItem("activity")) || [];

    let html = "";

    if (activity.length <= 3) {
        html = "<p>No old history found.</p>";
    } else {
        activity.slice(3).forEach(item => {
            html += `
            <div class="item">
                <div class="item-left">
                    <h3>${item.branch}</h3>
                    <p>${item.date}</p>
                </div>
                <div class="item-right">+1 Stamp</div>
            </div>
            `;
        });
    }

    document.getElementById("historyList").innerHTML = html;
}

// SEARCH
function searchHistory() {
    const searchValue = document
        .querySelector(".search")
        .value
        .toLowerCase();

    let activity = JSON.parse(localStorage.getItem("activity")) || [];

    let filtered = activity.slice(3).filter(item =>
        item.branch.toLowerCase().includes(searchValue) ||
        item.date.toLowerCase().includes(searchValue)
    );

    let html = "";

    filtered.forEach(item => {
        html += `
        <div class="item">
            <div class="item-left">
                <h3>${item.branch}</h3>
                <p>${item.date}</p>
            </div>
            <div class="item-right">+1 Stamp</div>
        </div>
        `;
    });

    document.getElementById("historyList").innerHTML =
        html || "<p>No results found.</p>";
}

// RUN
renderHistoryPage();

// EVENT
document.querySelector(".search").addEventListener("input", searchHistory);