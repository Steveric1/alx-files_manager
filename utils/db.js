import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

/* class for performing mongo operation */
class DBClient {
  constructor() {
    // connect to mogodb database
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.log(err.message);
        this.db = false;
      } else {
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      }     
    })
  }

  /**
   * Method that check if connection is alive
   * @return {boolean} true if the connection is alve or false if not
   */
  isAlive() {
    return Boolean(this.db)
  }

  /**
   * Method that get the collection
   * @return {Number} return number of document
   * in the collection user
   */
  async nbUsers() {
    const numberOfUsers = await this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  /**
   * Method that get the files collections
   * @return {Number} return number of document in
   * the collection files
   */
  async nbFiles() {
    const numberOfFiles = await this.filesCollection.countDocuments();
    return numberOfFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;
