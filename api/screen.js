const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// Mock database of physicians
const physicians = [
    {
        name: 'John Doe',
        npi: '1234567890',
        credentials: 'MD',
        address: '123 Main St, Anytown, USA',
        backgroundCheck: {
            passed: true,
            details: ['No criminal records found', 'Valid medical license']
        }
    },
    {
        name: 'Jane Smith',
        npi: '9876543210',
        credentials: 'DO',
        address: '456 Elm St, Othertown, USA',
        backgroundCheck: {
            passed: false,
            details: ['Criminal record found', 'Expired medical license']
        }
    }
];

// Screening function to find physician and perform background check
function screenHCP(name) {
    const physician = physicians.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (!physician) {
        return {
            found: false,
            message: 'No matching physician found.'
        };
    }

    return {
        found: true,
        physician: {
            name: physician.name,
            npi: physician.npi,
            credentials: physician.credentials,
            address: physician.address,
            backgroundCheck: physician.backgroundCheck
        }
    };
}

app.post('/api/screen', (req, res) => {
    const { name } = req.body;
    const result = screenHCP(name);
    res.json(result);
});

module.exports = app;
