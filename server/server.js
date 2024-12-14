const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

require('dotenv').config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'https://yt-clone-frontend-bxl3.onrender.com', // Replace with the actual origin of your React app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials like cookies (if needed)
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail'
    auth: {
      user: process.env.nodemailer_email,
      pass: process.env.nodemailer_pass,
    },
  });


/*
 const con = mysql.createConnection(
    {
        user: "root",
        host: "localhost",
        password: "Jktrxsw2005",
        database: "youtube_clone",
    }
  )
*/



const con = mysql.createConnection({
  host: process.env.DATABASE_HOST, // Ngrok host
  port: process.env.DATABASE_PORT,            // Ngrok port
  user: 'root',           // Your database username
  password: process.env.DATABASE_PASS,
  database: 'youtube_clone',
});





// AWS SDK will automatically use environment variables for credentials
const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});



// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


function generateVerificationCode() {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



con.connect((err) => {
  if (err) {
      console.error('Error connecting to the database:', err);
      return;
  }
  console.log('Connected to the database via Ngrok!');
});




// Route for uploading video
app.post('/upload-video', upload.single('video'), extractUserId, async (req, res) => {
  const userId = req.userId;
  console.log(userId);
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `videos/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read',
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));

    const videoUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    const query = 'INSERT INTO videos (url, UserWhoUpload) VALUES (?, ?)';

    con.query(query, [videoUrl, userId], (dbErr, result) => {
      if (dbErr) {
        console.error('Database Error:', dbErr);
        return res.status(500).send('Error saving video URL to database');
      }

      res.status(200).json({ videoUrl });
    });
  } catch (s3Err) {
    console.error('S3 Upload Error:', s3Err);
    res.status(500).send('Error uploading to S3');
  }
});



app.get('/videos', extractUserId, async (req, res) => {
  const searchQuery = req.query.search || ''; // Search term from query parameter
  const userId = req.userId;

  let query = 'SELECT * FROM videos';
  const params = [];
  if (searchQuery) {
      query += ' WHERE name LIKE ?'; // Update based on the actual column name
      params.push(`%${searchQuery}%`);
  }

  try {
      if (!con) {
          console.error('Database connection is not established.');
          res.status(500).send('Database connection error');
          return;
      }

      const [rows, fields] = await con.promise().query('SELECT * FROM videos');
      console.log('Rows:', rows);
      res.json(rows); // Send results to client
  } catch (err) {
      console.error('Query error:', err.message); // Log the actual error
      res.status(500).send('Database query failed');
  }
});








  app.post('/register', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const plainPassword = req.body.password; // Get the plain text password
    const verificationCode = generateVerificationCode(); // Generate a 5-digit code
  
    console.log("Request received at /register");
  
    try {
      // Hash the password
      const saltRounds = 10; // You can adjust the number of salt rounds for security
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  
      // Insert user data and hashed password along with the verification code into the database
      con.query(
        "INSERT INTO users (name, email, password, verification_code) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, verificationCode],
        (err, result) => {
          if (result) {
            res.send(result);
          } else {
            res.send({ message: "ENTER CORRECT ASKED DETAILS!" });
          }
        }
      );
    } catch (err) {
      console.error("Error registering user: " + err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });
  
  app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    con.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Error querying the database: ' + err);
        return res.status(500).send({ message: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        console.log('no user');
        return res.status(401).send({ message: 'Wrong email' });
      }
  
      const user = results[0];
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        console.log('logged');
  
        if (!user.email_verified_at) {
          // Email is not verified, send the verification code and navigate to EmailVerification
          const verificationCode = user.verification_code;
          const emailMessage = `Your verification code is: ${verificationCode}`;
  
          const mailOptions = {
            from: '"YTclone.com" <alexxxx444422@gmail.com>',
            to: user.email,
            subject: 'Verification Code',
            text: emailMessage,
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email: ' + error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          const token = jwt.sign(
            {
              userId: user.id,
              userName: user.name,
              email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );
          console.log(token);
          console.log("111");
  
          res.status(200).send({ message: 'Email not verified', token, email_verified_at: null });
        } else {
          // Email is already verified, you can navigate to another page (e.g., MainPage)
          // Generate a JWT token with the user ID
          const token = jwt.sign(
            {
              userId: user.id,
              userName: user.name,
              email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );
          console.log(token);
          console.log("222");
          // Send the JWT token as part of the response
          res.status(200).send({ message: 'Login successful', token, email_verified_at: user.email_verified_at });
        }
      } else {
        console.log('not logged');
        res.status(401).send({ message: 'Wrong email or password' });
      }
    });
  });


  app.post("/verify-code", async (req, res) => {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;
  
    con.query(
      "SELECT * FROM users WHERE email = ? AND verification_code = ?",
      [email, verificationCode],
      async (err, results) => {
        if (err) {
          console.error("Error querying the database: " + err);
          return res.status(500).send({ message: "Internal Server Error" });
        }
  
        if (results.length === 0) {
          console.log("Invalid verification code or email");
          return res.status(401).send({ message: "Invalid verification code or email" });
        }
  
        const user = results[0];
  
        // Update the email_verified_at column with the current timestamp
        con.query(
          "UPDATE users SET email_verified_at = CURRENT_TIMESTAMP() WHERE email = ?",
          [email],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("Error updating email_verified_at: " + updateErr);
              return res.status(500).send({ message: "Internal Server Error" });
            }
  
            console.log("Email verified successfully");
            res.status(200).send({ message: "Email verified successfully" });
          }
        );
      }
    );
  });

  
  app.put('/update-profile', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Get the token from headers
  
    // Verify and decode the token to get the user's information
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('JWT Verification Error:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
      }
      console.log(decoded.userId);
      const userId = decoded.userId; // Access the user ID from the decoded token
      const { userName } = req.body;
  
      // Validate the incoming data (you can add more validation as needed)
      if (!userName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Update the user's profile in the database
      const sql = 'UPDATE users SET name = ? WHERE id = ?';
      con.query(sql, [userName, userId], (err, result) => {
        if (err) {
          console.error('Error updating profile:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        console.log('Profile updated successfully');
        return res.status(200).json({ message: 'Profile updated successfully' });
      });
    });
  });
  
  // Function to get user data by userId
  async function getUserById(userId) {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          // Assuming you expect a single user with this ID, return the first result
          resolve(results[0]);
        }
      });
    });
  }
  
  app.post('/change-password', extractUserId, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;
  
    try {
      // Get the user's current data from the database
      const user = await getUserById(userId);
  console.log(user.password)
      // Check if the old password matches the stored password
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      con.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId],
        (err, results) => {
          if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }
  
          res.status(200).json({ message: 'Password changed successfully' });
        }
      );
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  const saltRounds = 10;


  app.put('/update-password', extractUserId, async(req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId;

    console.log(userId)
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
  
    const getUserQuery = 'SELECT password FROM users WHERE id = ?';
  
    con.query(getUserQuery, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error retrieving user information' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const hashedCurrentPassword = results[0].password;
  
      bcrypt.compare(currentPassword, hashedCurrentPassword, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error comparing passwords' });
        }
  
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
  
        bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error hashing new password' });
          }
  
          const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
          con.query(updatePasswordQuery, [hashedNewPassword, userId], (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Error updating kuku' });
            }
  
            res.json({ message: 'Password updated successfully' });
          });
        });
      });
    });
  });


  
  app.get('/SetProfile', (req, res) => {
    // Get the Authorization header from the request
    const authorizationHeader = req.headers.authorization;
  
    // Check if the header exists and starts with "Bearer "
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      // Extract the token part by splitting the header string
      const token = authorizationHeader.split(' ')[1];
  
      // Verify the JWT token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log('JWT Verification Error:', err.message);
          // Token verification failed, user is not authenticated
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        // Token is valid, you can access the user's information in 'decoded'
        const userId = decoded.userId;
  
        // Now, fetch user data (name, email) from the database based on the userId
        const selectSql = 'SELECT name, email FROM users WHERE id = ?';
        con.query(selectSql, [userId], (selectErr, selectResult) => {
          if (selectErr) {
            console.error('Error fetching user data:', selectErr);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          const userData = selectResult[0]; // Assuming there is only one user with the given ID
  
          // Send the user's data to the client
          res.status(200).json(userData);
        });
      });
    } else {
      console.log('Bearer token not provided');
      // Bearer token is not provided in the header
      res.status(401).json({ message: 'Bearer token required' });
    }
  });

  // Middleware to extract userId from token
function extractUserId(req, res, next) {
    // Get the Authorization header from the request
    const authorizationHeader = req.headers.authorization;
  
    // Check if the header exists and starts with "Bearer "
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      // Extract the token part by splitting the header string
      const token = authorizationHeader.split(' ')[1];
  
      // Verify the JWT token and extract userId
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log('JWT Verification Error:', err.message);
          // Token verification failed, return an error
          return res.status(401).json({ message: 'Invalid token' });
        }
  
        // Token is valid, and you can access the user's information in 'decoded'
        req.userId = decoded.userId; // Attach userId to the request object
        next(); // Continue to the next middleware or route handler
      });
    } else {
      console.log('Bearer token not provided');
      // Bearer token is not provided in the header
      res.status(401).json({ message: 'Bearer token required' });
    }
  }







app.listen(3001, () => {
    console.log("running on port 3001");
})
    
