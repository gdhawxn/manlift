import mongoose from 'mongoose';
import config from '../config/config';

let mongodb = {
  getConnection: () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(config.database, function(err) {
        if(err) {
          reject(err);
        } else {
          resolve("Connected to DB");
        }
      });
    })
  }
}

export default mongodb;
