const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// Mock screening function
function screenHCP(name) {
    // For simplicity, let's say if the name contains "fail", the screening fails.
    if (name.toLowerCase().includes('fail')) {
        return { pass: false, message: 'Issues found during screening.' };
    } else {
        return { pass: true, message: 'No issues found.' };
    }
}

app.post('/api/screen', (req, res) => {
    const { name } = req.body;
    const result = screenHCP(name);
    res.json(result);
});

module.exports = app;
