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
                resultText.className = 'alert alert-info';
                const selectList = document.createElement('select');
                selectList.id = 'physicianSelect';
                selectList.className = 'form-control mb-3';
                data.physicians.forEach((physician, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = `${physician.name} (${physician.address})`;
                    selectList.appendChild(option);
                });
                detailsList.appendChild(selectList);
                const selectButton = document.createElement('button');
                selectButton.textContent = 'Select';
                selectButton.className = 'btn btn-secondary';
                selectButton.addEventListener('click', function() {
                    const selectedIndex = document.getElementById('physicianSelect').value;
                    displayPhysicianDetails(data.physicians[selectedIndex]);
                });
                detailsList.appendChild(selectButton);
            }
        } else {
            resultText.textContent = `Physician Not Found: ${data.name}`;
            resultText.className = 'alert alert-danger';

            const messageItem = document.createElement('div');
            messageItem.textContent = data.message;
            detailsList.appendChild(messageItem);
        }

        resultsDiv.classList.remove('d-none');
    })
    .catch(error => console.error('Error:', error));
});

function displayPhysicianDetails(physician) {
    const resultText = document.getElementById('resultText');
    const detailsList = document.getElementById('detailsList');

    // Clear previous details
    detailsList.innerHTML = '';

    resultText.textContent = `Physician Found: ${physician.name}`;
    resultText.className = 'alert alert-success';

    // Create sections for details
    const sections = {
        'Education': physician.backgroundCheck.details.education,
        'Residency': physician.backgroundCheck.details.residency,
        'Professional Affiliations': physician.backgroundCheck.details.affiliations,
        'Continuing Medical Education': physician.backgroundCheck.details.cme,
        'Hospital Privileges': physician.backgroundCheck.details.hospitalPrivileges,
        'Employment History': physician.backgroundCheck.details.employmentHistory,
        'Peer Reviews': 'Positive reviews from peers',
        'Patient Reviews and Ratings': physician.backgroundCheck.details.ratings,
        'Research and Publications': physician.backgroundCheck.details.publications,
        'Languages Spoken': physician.backgroundCheck.details.languages,
        'Special Skills or Certifications': physician.backgroundCheck.details.skills,
        'State Licenses': physician.state_licenses.map(license => `${license.state}: ${license.license} (Status: ${license.status})`).join(', '),
        'Criminal Background Check': physician.backgroundCheck.details.criminalCheck,
        'Malpractice History': physician.backgroundCheck.details.malpracticeHistory,
        'Sanctions and Disciplinary Actions': physician.backgroundCheck.details.sanctions,
        'DEA Registration': physician.backgroundCheck.details.deaRegistration,
        'Continuous Monitoring': physician.backgroundCheck.details.continuousMonitoring
    };

    for (const [sectionTitle, sectionContent] of Object.entries(sections)) {
        const section = document.createElement('div');
        section.className = 'mb-3';

        const sectionHeader = document.createElement('h5');
        sectionHeader.textContent = sectionTitle;
        section.appendChild(sectionHeader);

        const sectionBody = document.createElement('p');
        sectionBody.textContent = sectionContent;
        section.appendChild(sectionBody);

        detailsList.appendChild(section);
    }

    // Add download PDF button functionality
    document.getElementById('downloadPdf').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text(`Physician Found: ${physician.name}`, 10, 10);
        let yPosition = 20;

        for (const [sectionTitle, sectionContent] of Object.entries(sections)) {
            doc.text(sectionTitle, 10, yPosition);
            yPosition += 10;
            doc.text(sectionContent, 10, yPosition);
            yPosition += 10;
        }

        doc.save(`${physician.name}_details.pdf`);
    });
}
