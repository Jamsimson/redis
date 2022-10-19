async function start(data) {
  const redis = require("redis");
  const { SchemaFieldTypes } = redis;
  const { createClient } = redis;
  const chatQueueKeyName = "etneca:chat:outGoing";
  const chatQueueLastTamp = "system:outGoing";
  const redisClient = require("./services/redis.client");
  class Queue {
    // Array is used to implement a Queue
    constructor() {
      this.items = [];
    }
    clear_queue() {
      this.items = [];
    }
    enqueue(element) {
      // adding element to the queue
      this.items.push(element);
    }
    // dequeue function
    dequeue() {
      if (this.isEmpty()) return "Underflow";
      return this.items.shift();
    }
    front() {
      if (this.isEmpty()) return "No elements in Queue";
      return this.items[0];
    }
    last() {
      if (this.isEmpty()) return "No elements in Queue";
      return this.items[this.items.length - 1];
    }
    isEmpty() {
      // return true if the queue is empty.
      return this.items.length == 0;
    }
    printQueue() {
      var str = "";
      for (var i = 0; i < this.items.length; i++) str += this.items[i] + " ";
      return str;
    }
  }
  var queue = new Queue();
  // var last_tamps = redisClient.getLastTamps()
  // var val = redisClient.getVal()
  // var cnt = redisClient.getCount()

  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  createRedisJSONIndex("timestamp", SchemaFieldTypes.NUMERIC, chatQueueKeyName);
  createRedisJSONIndex(
    "last_timestamp",
    SchemaFieldTypes.NUMERIC,
    chatQueueLastTamp
  );
  createRedisJSONIndex("sender", SchemaFieldTypes.TAG, chatQueueKeyName);
  redisClient.setCount(this.cnt);
  var data_str = `${data.timestamp},${data.app_id},${data.SOS},${data.message}\r\n`;
  queue.enqueue(data_str);
  await client.json.set(`${chatQueueKeyName}:${data.timestamp}`, "$", data);

  console.log(`last timetm: `, redisClient.getLastTamps());
  console.log(`val: `, redisClient.getVal());

  if (this.last_tamps == 0) {
    var q = queue.last().split(",");
    // last_tamps = parseInt(q[0]);
    redisClient.setLastTamps(Number(q[0]));
    // last_tamps = redisClient.getLastTamps
  } else {
    // val = data.timestamp;
    redisClient.setVal(data.timestamp);
    // val = redisClient.getVal()
  }
  // console.log(` number q`,Number(q[0]));
  // console.log(`data.tamps`,data.timestamp);

  // }

  if (redisClient.getLastTamps() < redisClient.getVal()) {
    if (redisClient.getCount() > 1) {
      redisClient.setLastTamps(this.last_tamps + 1);
      // this.last_tamps = redisClient.getLastTamps()
    }
    const tamp = { timestamp: redisClient.getLastTamps() };
    await client.json.set(`${chatQueueLastTamp}`, "$", tamp);
    const results = await client.ft.search(
      "idx:timestamp",
      `@timestamp:[${redisClient.getLastTamps()} inf]`
    );
    console.log("last_tamps < val : ", results);
    redisClient.setLastTamps(redisClient.getVal());
  } else {
    console.log(`No go into if😵‍💫`);
  }
  queue.clear_queue();
  return redisClient.getCount();

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
}
module.exports = {
  start,
};
