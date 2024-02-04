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
    console.log('hello inside root');
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    console.log('hello inside root');
    res.sendFile(`${appPublicFir}/login.html`);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the entered username and password match the stored user
    const storedUser = JSON.parse(localStorage.getItem(username));
    if (storedUser && storedUser.password === password) {
        res.redirect('/userDetails?username=' + username);
    } else {
        res.send(`
            <h2>Invalid credentials. Please try again.</h2>
            <p>Not a user? <a href="/register">Register here</a></p>
        `);
    }
});

app.get('/register', (req, res) => {
    console.log('hello inside root');
    res.sendFile(`${appPublicFir}/register.html`);
});

app.post('/register', (req, res) => {
    console.log('hello inside root');
    const { firstName, lastName, email, username, password } = req.body;

    // Store user details in local storage
    const userDetails = { firstName, lastName, email, username, password };
    localStorage.setItem(username, JSON.stringify(userDetails));

    res.redirect('/login');
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});