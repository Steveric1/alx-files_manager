import sha1 from 'sha1';
import dbClient from '../utils/db';

class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // email missing
    if (!email) return res.status(400).json({ error: 'Missing email' });

    // password missing
    if (!password) return res.status(400).json({ error: 'Missing password' });

    // checking if the email already exist
    const existingEmail = await dbClient.usersCollection.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Already exist' });

    // encrypt password with SHA1
    const encryptPsswd = sha1(password);

    try {
      // create new user
      const newUser = { email, password: encryptPsswd };
      const result = await dbClient.usersCollection.insertOne(newUser);

      return res.status(201).json({ id: result.insertedId, email });
    } catch (err) {
      console.log('Error creating new user: ', err.message);
      return res.statu(500).json({ error: 'Internal server error' });
    }
  }
}

export default UserController;
