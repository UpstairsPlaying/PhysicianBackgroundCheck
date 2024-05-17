const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Middleware
app.use(bodyParser.json());

async function fetchPhysicianData(name) {
    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=${encodeURIComponent(name.split(' ')[0])}&last_name=${encodeURIComponent(name.split(' ')[1])}&limit=10`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.results && response.data.results.length > 0) {
            const physicians = response.data.results.map(physician => ({
                name: `${physician.basic.first_name} ${physician.basic.last_name}`,
                npi: physician.number,
                credentials: physician.basic.credential,
                address: `${physician.addresses[0].address_1}, ${physician.addresses[0].city}, ${physician.addresses[0].state} ${physician.addresses[0].postal_code}`,
                state_licenses: physician.taxonomies.map(t => t.state),
                backgroundCheck: performBackgroundCheck(physician)
            }));
            return {
                found: true,
                physicians: physicians
            };
        } else {
            return {
                found: false,
                name: name,
                message: 'No matching physician found.'
            };
        }
    } catch (error) {
        return {
            found: false,
            name: name,
            message: 'Error fetching data from NPPES API.'
        };
    }
}

function performBackgroundCheck(physician) {
    // Mock background check results
    return {
        passed: true,
        details: [
            'Credentials Verified: MD',
            'Board Certification Verified: Yes',
            'State Licenses: ' + physician.taxonomies.map(t => t.state).join(', '),
            'Criminal Background Check: No records found',
            'Malpractice History: No cases found',
            'Sanctions and Disciplinary Actions: No actions found',
            'DEA Registration: Valid',
            'Continuous Monitoring: No new alerts'
        ]
    };
}

app.post('/api/screen', async (req, res) => {
    const { name } = req.body;
    const result = await fetchPhysicianData(name);
    res.json(result);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;
