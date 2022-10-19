const redis = require("redis");
const client = redis.createClient();
const chatQueueKeyName = "etneca:store";
const { SchemaFieldTypes } = redis

// function start connect to redis
async function start() {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect().then(console.log(`Connected..😖`));
  return true;
}
//  connection declare for store boolean value from start fucntion
var connection = start();

// SEND MESSAGE
async function senderMessage(newMessage) {
  if (connection === false) {
    console.log(`😵‍💫Not connected`);
  } else {
    const timestamp = Date.now();
    const data = {
      timestamp: timestamp,
      app_id: newMessage.app_id,
      SOS: newMessage.SOS,
      message: newMessage.message,
    };
    await client.json
      .set(`${chatQueueKeyName}:${timestamp}`, "$", data)
      .then(console.log(`Successfully🚀🚀🚀 Your data has send now`));
  }
}

async function getMessage(){
    if (connection === false) {
        console.log(`😵‍💫Not connected`);
      }
    else{
      await client.ft.create('idx:timestamp', {
        app_id: {
          type: SchemaFieldTypes.TEXT,
          sortable: true
        },
          species: SchemaFieldTypes.TAG,
          age: SchemaFieldTypes.NUMERIC
        }, {
          ON: 'HASH',
          PREFIX: 'noderedis:animals'
        }
      );
    }
}



module.exports = {
  senderMessage,
  getMessage
};
