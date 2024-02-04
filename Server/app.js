const express = require('express');
const bodyParser = require('body-parser');
const { LocalStorage } = require('node-localstorage');
const path = require('path');
const app = express();
const port = 80;
const appBasePath = process.cwd();
const appPublicFir = path.join(appBasePath, '/public');

app.use(bodyParser.urlencoded({ extended: true }));

// Initialize local storage in the 'localStorage' folder
const localStorage = new LocalStorage('./localStorage');

// Serve static files from the 'public' directory
app.use(express.static(appPublicFir));

// Redirect to login page on root access
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(`${appPublicFir}/login.html`);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const storedUser = JSON.parse(await localStorage.getItem(username));

        if (storedUser && storedUser.password === password) {
            res.redirect('/userDetails?username=' + username);
        } else {
            res.send(`
                <h2>Invalid credentials. Please try again.</h2>
                <p>Not a user? <a href="/register">Register here</a></p>
            `);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

app.get('/register', (req, res) => {
    console.log('hello inside root');
    res.sendFile(`${appPublicFir}/register.html`);
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    try {
        const userDetails = { firstName, lastName, email, username, password };
        await localStorage.setItem(username, JSON.stringify(userDetails));

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

app.get('/userDetails', (req, res) => {
    const storedUser = JSON.parse(localStorage.getItem(req.query.username));

    if (storedUser) {
        res.send(`
            <h2>User Details:</h2>
            <p>First Name: ${storedUser.firstName}</p>
            <p>Last Name: ${storedUser.lastName}</p>
            <p>Email: ${storedUser.email}</p>
            <p>Username: ${req.query.username}</p>
        `);
    } else {
        res.send('<h2>User not found.</h2>');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
