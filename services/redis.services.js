const redis = require("redis");
const incommingQueueKeyName = "etneca:chat:inComing";
// const outgoingQueueKeyName = "etneca:outgoing";
const { SchemaFieldTypes } = redis;
const redisClient = require("./redis.client");
const toSkyWaveQueue = require("../toSkyWaveQueue");

// SEND MESSAGE
async function saveMessage(newMessage) {
  try {
    await redisClient.getConnection();
    const timestamp = Date.now();
    const data = {
      timestamp: timestamp,
      app_id: newMessage.app_id,
      SOS: newMessage.SOS,
      message: newMessage.message,
    };
    toSkyWaveQueue.start(data).then(console.log(`Successfully🥓🥓`));
  } catch (error) {
    console.log(error);
    return {
      status: "failed",
      error: error,
    };
  }
}

// GET MESSAGE
async function getMessage(serachTimestamp) {
  const client = await redisClient.getConnection();
  
  createRedisJSONIndex("timestamp",SchemaFieldTypes.NUMERIC,incommingQueueKeyName);
  const results = await client.ft.search(
    "idx:timestamp",
    // ${serachTimestamp}
    `@timestamp:[${serachTimestamp} inf]`
  );
  console.log(`🔍GET results:${serachTimestamp}: `, results);
  return results;
}

async function createRedisJSONIndex(name, type, prefix) {
  try {
    const client = await redisClient.getConnection();
    const fieldName = `$.${name}`;
    var indexFiled = {};

    if (type === SchemaFieldTypes.TEXT) {
      indexFiled[fieldName] = {
        type: type,
      };
    } else {
      indexFiled[fieldName] = {
        type: type,
        AS: name,
      };
    }
    await client.ft.create(`idx:${name}`, indexFiled, {
      ON: "JSON",
      PREFIX: prefix,
    });
  } catch (e) {
    if (e.message === "Index already exists") {
      console.log(`Index exists already, skipped creation.${name}`);
    } else {
      console.error(e);
      process.exit(1);
    }
  }
}
module.exports = {
  saveMessage,
  getMessage,
};
