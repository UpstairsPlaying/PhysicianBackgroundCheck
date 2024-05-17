document.getElementById('screeningForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const hcpName = document.getElementById('hcpName').value;

    fetch('/api/screen', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: hcpName })
    })
    .then(response => response.json())
    .then(data => {
        const resultText = document.getElementById('resultText');
        const resultsDiv = document.getElementById('results');
        const detailsList = document.getElementById('detailsList');

        // Clear previous details
        detailsList.innerHTML = '';

        if (data.found) {
            if (data.physicians.length === 1) {
                displayPhysicianDetails(data.physicians[0]);
            } else {
                resultText.textContent = `Multiple matches found for "${hcpName}". Please select one:`;
                resultText.className = 'info';
                const selectList = document.createElement('select');
                selectList.id = 'physicianSelect';
                data.physicians.forEach((physician, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = `${physician.name} (${physician.address})`;
                    selectList.appendChild(option);
                });
                detailsList.appendChild(selectList);
                const selectButton = document.createElement('button');
                selectButton.textContent = 'Select';
                selectButton.addEventListener('click', function() {
                    const selectedIndex = document.getElementById('physicianSelect').value;
                    displayPhysicianDetails(data.physicians[selectedIndex]);
                });
                detailsList.appendChild(selectButton);
            }
        } else {
            resultText.textContent = `Physician Not Found: ${data.name}`;
            resultText.className = 'fail';

            const messageItem = document.createElement('li');
            messageItem.textContent = data.message;
            detailsList.appendChild(messageItem);
        }

        resultsDiv.classList.remove('hidden');
    })
    .catch(error => console.error('Error:', error));
});

function displayPhysicianDetails(physician) {
    const resultText = document.getElementById('resultText');
    const detailsList = document.getElementById('detailsList');

    // Clear previous details
    detailsList.innerHTML = '';

    resultText.textContent = `Physician Found: ${physician.name}`;
    resultText.className = 'pass';

    const credentialsItem = document.createElement('li');
    credentialsItem.textContent = `Credentials: ${physician.credentials}`;
    detailsList.appendChild(credentialsItem);

    const npiItem = document.createElement('li');
    npiItem.textContent = `NPI: ${physician.npi}`;
    detailsList.appendChild(npiItem);

    const addressItem = document.createElement('li');
    addressItem.textContent = `Address: ${physician.address}`;
    detailsList.appendChild(addressItem);

    const stateLicensesHeader = document.createElement('li');
    stateLicensesHeader.textContent = 'State Licenses:';
    detailsList.appendChild(stateLicensesHeader);

    physician.state_licenses.forEach(state_license => {
        const stateLicenseItem = document.createElement('li');
        stateLicenseItem.textContent = `${state_license.state}: ${state_license.license}`;
        detailsList.appendChild(stateLicenseItem);
    });

    const backgroundCheckHeader = document.createElement('li');
    backgroundCheckHeader.textContent = 'Background Check:';
    detailsList.appendChild(backgroundCheckHeader);

    physician.backgroundCheck.details.forEach(detail => {
        const detailItem = document.createElement('li');
        detailItem.textContent = detail;
        detailsList.appendChild(detailItem);
    });

    if (physician.backgroundCheck.passed) {
        const passItem = document.createElement('li');
        passItem.textContent = 'Background Check Passed';
        passItem.className = 'pass';
        detailsList.appendChild(passItem);
    } else {
        const failItem = document.createElement('li');
        failItem.textContent = 'Background Check Failed';
        failItem.className = 'fail';
        detailsList.appendChild(failItem);
    }
}
