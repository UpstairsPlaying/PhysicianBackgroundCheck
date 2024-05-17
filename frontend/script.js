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
            const physician = data.physician;
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

        } else {
            resultText.textContent = data.message;
            resultText.className = 'fail';
        }

        resultsDiv.classList.remove('hidden');
    })
    .catch(error => console.error('Error:', error));
});
