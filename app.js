import express from "express";
import request from "request";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Configure dotenv to load env variables
dotenv.config();

// ES6 module imports disable previous Node variable __dirname, so we need to build it
// This variable will contain the absolute path of current executed file (app.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAILCHIMP_DATA_CENTER = process.env.MAILCHIMP_DATA_CENTER || "";
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const LIST_AUDIENCE_ID = process.env.LIST_AUDIENCE_ID || "";

const app = express();

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Signup Route
app.post("/signup", (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    res.redirect("/fail.html");
    return;
  }

  // Construct request data
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const postData = JSON.stringify(data);

  const options = {
    url: `https://${MAILCHIMP_DATA_CENTER}.api.mailchimp.com/3.0/lists/${LIST_AUDIENCE_ID}`,
    method: "POST",
    headers: {
      Authorization: MAILCHIMP_API_KEY,
    },
    body: postData,
  };

  request(options, (err, response, body) => {
    console.log(err, response, body);
    if (err) {
      res.redirect("/fail.html");
    } else {
      if (response.statusCode === 200) res.redirect("/success.html");
      else res.redirect("/fail.html");
    }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server started on ${port}`));
