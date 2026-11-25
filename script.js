
const tokenForm = document.getElementById("tokenForm");
const customerName = document.getElementById("customerName");
const service = document.getElementById("service");

const queueTable = document.getElementById("queueTable");
const emptyMessage = document.getElementById("emptyMessage");

let queue = JSON.parse(localStorage.getItem("queueLessData")) || [];
let tokenNumber = Number(localStorage.getItem("queueLessToken")) || 1;

function saveData() {
    localStorage.setItem("queueLessData", JSON.stringify(queue));
    localStorage.setItem("queueLessToken", tokenNumber);
}

function generateToken() {
    return "Q" + String(tokenNumber).padStart(3, "0");
}

function addToken(event) {
    event.preventDefault();

    const name = customerName.value.trim();
    const selectedService = service.value;

    if (!name || !selectedService) {
        alert("Please enter all details.");
        return;
    }

    const token = {
        id: Date.now(),
        number: generateToken(),
        name: name,
        service: selectedService,
        status: "Waiting"
    };

    queue.push(token);
    tokenNumber++;

    saveData();
    updateDashboard();

    document.getElementById("newToken").textContent = token.number;

    const waitingAhead = queue.filter(
        item => item.status === "Waiting" && item.id !== token.id
    ).length;

    document.getElementById("tokenMessage").textContent =
        "Your token has been generated successfully! There are " +
        waitingAhead + " customers waiting ahead of you.";

    document.getElementById("tokenResult").classList.remove("hidden");

    tokenForm.reset();
}

function callNext() {
    // Complete the previous serving token
    const previous = queue.find(item => item.status === "Serving");

    if (previous) {
        previous.status = "Completed";
    }

    // Find the next waiting customer
    const next = queue.find(item => item.status === "Waiting");

    if (!next) {
        alert("No customers are waiting!");
        updateDashboard();
        return;
    }

    next.status = "Serving";

    saveData();
    updateDashboard();

    alert("Now serving token: " + next.number);
}

function cancelToken(id) {
    const customer = queue.find(item => item.id === id);

    if (!customer || customer.status !== "Waiting") {
        return;
    }

    customer.status = "Cancelled";

    saveData();
    updateDashboard();
}

function resetQueue() {
    const confirmReset = confirm(
        "Are you sure you want to reset the entire queue?"
    );

    if (confirmReset) {
        queue = [];
        tokenNumber = 1;

        saveData();
        updateDashboard();

        document.getElementById("tokenResult").classList.add("hidden");
    }
}

function updateDashboard() {
    const waiting = queue.filter(
        item => item.status === "Waiting"
    );

    const completed = queue.filter(
        item => item.status === "Completed"
    );

    const serving = queue.find(
        item => item.status === "Serving"
    );

    // Statistics
    document.getElementById("totalTokens").textContent =
        queue.length;

    document.getElementById("waitingCount").textContent =
        waiting.length;

    document.getElementById("completedCount").textContent =
        completed.length;

    // Assuming each customer takes 5 minutes
    document.getElementById("estimatedWait").textContent =
        (waiting.length * 5) + " min";

    // Currently serving
    document.getElementById("currentToken").textContent =
        serving ? serving.number : "--";

    document.getElementById("currentName").textContent =
        serving ? serving.name : "No customer currently serving";

    document.getElementById("heroServing").textContent =
        serving ? serving.number : "--";

    // Queue table
    queueTable.innerHTML = "";

    emptyMessage.style.display =
        queue.length === 0 ? "block" : "none";

    queue.forEach(item => {
        const row = document.createElement("tr");

        const statusClass = item.status.toLowerCase();

        const tokenCell = document.createElement("td");
        tokenCell.textContent = item.number;

        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;

        const serviceCell = document.createElement("td");
        serviceCell.textContent = item.service;

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = "badge " + statusClass;
        statusBadge.textContent = item.status;
        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");

        if (item.status === "Waiting") {
            const cancelButton = document.createElement("button");

            cancelButton.className = "cancel-btn";
            cancelButton.textContent = "Cancel";

            cancelButton.addEventListener("click", () => {
                cancelToken(item.id);
            });

            actionCell.appendChild(cancelButton);
        } else {
            actionCell.textContent = "-";
        }

        row.append(
            tokenCell,
            nameCell,
            serviceCell,
            statusCell,
            actionCell
        );

        queueTable.appendChild(row);
    });
}

// Event listeners
tokenForm.addEventListener("submit", addToken);

document.getElementById("nextBtn")
    .addEventListener("click", callNext);

document.getElementById("resetBtn")
    .addEventListener("click", resetQueue);

// Load previously saved queue data
updateDashboard();
