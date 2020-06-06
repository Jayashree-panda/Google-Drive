const express = require('express')
const cors = require('cors')
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const app = express()
app.use(cors())
app.use(express.json())

app.use(express.urlencoded())

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
function authorize(credentials, callback) {
    console.log("hi autho"+JSON.stringify(credentials.web.client_id)+"jj")
    // const {client_secret, client_id, redirect_uri} = JSON.stringify(credentials.web);
    const client_id = JSON.stringify(credentials.web.client_id);
    const client_secret = JSON.stringify(credentials.web.client_secret);
    const redirect_uri = JSON.stringify(credentials.web.redirect_uri);
    console.log(client_id+ "j")
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uri);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }
  
  function listFiles(auth) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length) {
        console.log('Files:');
        files.map((file) => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found.');
      }
    });
  }

app.post('/uploadFile',(req,res)=>{
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        console.log("lo")
        console.log(JSON.parse(content),"s")
        authorize(JSON.parse(content), listFiles);
      });
      
    console.log("hey"+ req.body)
})

app.get('/',(req,res)=>{
    res.send("hii")
})

app.get('/uploaded',(req,res)=>{
    console.log("hi")
    res.send("hey there")
})
app.listen('4000',()=>{
    console.log("app listening on port 4000")
})