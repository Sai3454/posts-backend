const express = require('express');
const bodyParser = require('body-parser');
const { createPool } = require('mysql');

const app = express();
const port = process.env.PORT || 9000;

app.use(bodyParser.json());

let db = null;

const initializeDBAndServer = () => {
  try {
    db = createPool({
      host: 'srv948.hstgr.io',
      user: 'u121649766_admin_posts',
      password: 'Impostsuser1',
      database: 'u121649766_posts',
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post('/api/signup', async (req, res) => {
  const { name, email } = req.body;

  if(!email.endsWith("@gmail.com")) return res.status(400).json({ message: 'Invalid Email type.' });
 

  try {
    // Check if the user already exists
    const checkQuery = `SELECT userid FROM USERS WHERE name = '${name}' AND email = '${email}'`;
    const checkResult = await new Promise((resolve) => {
        db.query(checkQuery, (err, result) => {
          resolve(result)
        })
      })


    if (checkResult.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Insert the new user
    const insertQuery = 'INSERT INTO USERS (name, email) VALUES (?, ?)';
    const insertValues = [name, email];
    await db.query(insertQuery, insertValues);

    return res.status(200).json({ message: 'Successful user sign-up.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/posts', async (req, res) => {
    const { userid, content } = req.body;

    try {
      // Check if the user already exists
      const checkQuery = `SELECT userid FROM USERS WHERE userid  = '${userid}'`;
      const checkResult = await new Promise((resolve) => {
          db.query(checkQuery, (err, result) => {
            resolve(result)
          })
        })
  
  
      if (checkResult.length === 0) {
        return res.status(404).json({ message: 'User ID not found.' });
      }

      if(content.length === 0) return res.status(400).json({message: "Content cannot be empty."})
  
      // Insert the new user
      const insertQuery = 'INSERT INTO POSTS (userid, content) VALUES (?, ?)';
      const insertValues = [userid, content];
      await db.query(insertQuery, insertValues);
  
      return res.status(200).json({ message: 'Successfully created.' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.delete('/api/deletepost/:postId', async (req, res) => {
    const {postId} = req.params

    try{
        // Check if the user already exists
        const checkQuery = `SELECT postid FROM POSTS WHERE postid  = '${postId}'`;
        const checkResult = await new Promise((resolve) => {
            db.query(checkQuery, (err, result) => {
              resolve(result)
            })
          })
    
    
        if (checkResult.length === 0) {
          return res.status(404).json({ message: 'Post ID not found.' });
        }
   
       const deleteQuery = `DELETE FROM POSTS WHERE postid = '${postId}'`
       await db.query(deleteQuery, (err, result) => {
           if(err) return res.status(403).json({"message": "Unauthorized to delete this post."})
           return res.status(200).json({"message": "Successful post deletion."})
       })
    }
    catch(err){
      return res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.get('/api/posts/:userId', async (req, res) => {
    const {userId} = req.params

    try{
        // Check if the user already exists
        const checkQuery = `SELECT userid FROM USERS WHERE userid  = '${userId}'`;
        const checkResult = await new Promise((resolve) => {
            db.query(checkQuery, (err, result) => {
              resolve(result)
            })
          })
    
    
        if (checkResult.length === 0) {
          return res.status(404).json({ message: 'User ID not found.' });
        }
   
       
        const selectQuery = `SELECT * FROM POSTS WHERE userid = '${userId}'`
        await db.query(selectQuery, (err, result) => {
            if(err) return res.status(400).json({"message": "Unauthorized to get the posts."})
            if(res.length === 0) return res.status(404).json({message: "No posts found for this user."})
            return res.status(200).json({ posts: result})
        })
    }
    catch(err){
      return res.status(500).json({ message: 'Internal Server Error' });
    }


})

app.listen(port, () => {
  console.log('Server running on port:', port);
});
