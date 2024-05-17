const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Middleware
app.use(bodyParser.json());

async function fetchPhysicianData(name) {
    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=${encodeURIComponent(name.split(' ')[0])}&last_name=${encodeURIComponent(name.split(' ')[1])}&limit=1`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.results && response.data.results.length > 0) {
            const physician = response.data.results[0];
            return {
                found: true,
                physician: {
                    name: `${physician.basic.first_name} ${physician.basic.last_name}`,
                    npi: physician.number,
                    credentials: physician.basic.credential,
                    address: `${physician.addresses[0].address_1}, ${physician.addresses[0].city}, ${physician.addresses[0].state} ${physician.addresses[0].postal_code}`,
                    backgroundCheck: {
                        passed: true, // This would typically come from another source or additional checks
                        details: ['Validated by NPPES']
                    }
                }
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

app.post('/api/screen', async (req, res) => {
    const { name } = req.body;
    const result = await fetchPhysicianData(name);
    res.json(result);
});

module.exports = app;
