const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('frontend'));

// Mock screening function
function screenHCP(name) {
    // For simplicity, let's say if the name contains "fail", the screening fails.
    if (name.toLowerCase().includes('fail')) {
        return { pass: false, message: 'Issues found during screening.' };
    } else {
        return { pass: true, message: 'No issues found.' };
    }
}

// Route for background screening
app.post('/screen', (req, res) => {
    const { name } = req.body;
    const result = screenHCP(name);
    res.json(result);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

