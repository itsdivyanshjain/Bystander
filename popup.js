// Function to get alert details from localStorage
// Function to sort alerts by most recent timestamp
function sortAlertsByTimestamp(alerts) {
    return alerts.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
}

// Updated function to get and sort alert details from localStorage
function getAlertDetails() {
    return new Promise((resolve) => {
        chrome.storage.local.get('alerts', (result) => {
            const alerts = result.alerts || [];
            const sortedAlerts = sortAlertsByTimestamp(alerts);
            resolve(sortedAlerts);
        });
    });
}

// Updated function to delete alert and maintain sort order
function deleteAlert(index) {
    chrome.storage.local.get('alerts', (result) => {
        let alerts = result.alerts || [];
        alerts.splice(index, 1);
        const sortedAlerts = sortAlertsByTimestamp(alerts);
        chrome.storage.local.set({ alerts: sortedAlerts }, () => {
            displayAlerts(sortedAlerts);
        });
    });
}

// Updated displayAlerts function to work with sorted alerts
function displayAlerts(sortedAlerts) {
    const alertList = document.getElementById('alertList');
    alertList.innerHTML = ''; // Clear existing alerts

    if (sortedAlerts.length === 0) {
        alertList.innerHTML = '<li>No alerts found.</li>';
        return;
    }

    sortedAlerts.forEach((alert, index) => {
        const alertItem = document.createElement('li');
        alertItem.className = `alert-item severity-${alert.severity}`;
        alertItem.innerHTML = `
            <h2>${alert.alertName}</h2>
            <p><strong>Evidence:</strong> ${alert.evidence}</p>
            <p><strong>URL:</strong> ${alert.url}</p>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            <p><strong>Context:</strong> ${alert.context}</p>
            <p><strong>Timestamp:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
        `;
        const deleteBtn = createDeleteButton(index);
        alertItem.appendChild(deleteBtn);
        alertList.appendChild(alertItem);
    });
}

// Function to create delete button
function createDeleteButton(index) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteAlert(index);
    };
    return deleteBtn;
}

function toggleTestingMode() {
    const testingModeToggle = document.getElementById('testing-mode-toggle');
    //console.log("testingModeToggle: ", testingModeToggle)
    chrome.storage.local.get('testingMode', (result) => {
        let testingMode = !result.testingMode; // toggle testing mode
        console.log("testingMode: ", testingMode)
        testingModeToggle.className = testingMode ? 'testing-mode-toggle-on' : 'testing-mode-toggle-off';
        testingModeToggle.textContent = testingMode ? 'ON' : 'OFF';
        chrome.storage.local.set({ testingMode: testingMode });
    });
}

// Load and display alerts when the popup is opened
document.addEventListener('DOMContentLoaded', async () => {
    const alerts = await getAlertDetails();
    displayAlerts(alerts);

    chrome.storage.local.get('testingMode', (result) => {
        testingMode = result.testingMode || false;
        const testingModeButton = document.createElement('button');
        testingModeButton.id = 'testing-mode-toggle';
        if (!testingMode) {
            chrome.storage.local.set({ testingMode: false });
            testingModeButton.className = 'testing-mode-toggle-off';
            testingModeButton.textContent = 'OFF';
        } else {
            testingModeButton.className = 'testing-mode-toggle-on';
            testingModeButton.textContent = 'ON';
        }
        testingModeButton.onclick = toggleTestingMode;
        document.getElementById('testing-mode').appendChild(testingModeButton);
    });

});