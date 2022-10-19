const redis = require("redis");
const incommingQueueKeyName = "etneca:incoming";
const outgoingQueueKeyName = "etneca:outgoing";
const { SchemaFieldTypes } = redis;
const redisClient = require("./redis.client");
const {toSkyway} = require('../toSkyWaveQueue')
// SEND MESSAGE
async function saveMessage(newMessage) {
  try {
    const client = await redisClient.getConnection();
    const timestamp = Date.now();
    const data = {
      timestamp: timestamp,
      app_id: newMessage.app_id,
      SOS: newMessage.SOS,
      message: newMessage.message,
    };
    // await client.json
    //   .set(`${outgoingQueueKeyName}:${timestamp}`, "$", data)
    //   .then(console.log(`Successfully🚀🚀🚀 Your data has send now`));
    toSkyway.op(data)
    return {
      status: "success",
      data: data,
      timestamp: Date.now(),
    };
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
  createRedisJSONIndex("timestamp", SchemaFieldTypes.NUMERIC, incommingQueueKeyName);
  const results = await client.ft.search(
    "idx:timestamp",
    `@timestamp:[${serachTimestamp} inf]`
  );
  console.log(`🔍GET results:${serachTimestamp}: `, results);
  return results;
}

// Create form search
async function createRedisJSONIndex(name, type, prefix) {
  try {
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
  createRedisJSONIndex,
};
