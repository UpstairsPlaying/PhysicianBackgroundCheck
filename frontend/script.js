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

        if (data.pass) {
            resultText.textContent = `Screening Passed: ${data.message}`;
            resultText.className = 'pass';
        } else {
            resultText.textContent = `Screening Failed: ${data.message}`;
            resultText.className = 'fail';
        }

        resultsDiv.classList.remove('hidden');
    })
    .catch(error => console.error('Error:', error));
});
