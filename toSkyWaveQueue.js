(async () => {
  const redis = require("redis");
  const { SchemaFieldTypes } = redis;
  const { createClient } = redis;
  const redisService = require("../services/redis.services");
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
  var last_tamps = "";
  var val = "";
  var cnt = 0;

  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  const chatQueueKeyName = "etneca:chat:outGoing";
  const chatQueueLastTamp = "system:outGoing";

  redisService.createRedisJSONIndex(
    "timestamp",
    SchemaFieldTypes.NUMERIC,
    chatQueueKeyName
  );
  redisService.createRedisJSONIndex(
    "last_timestamp",
    SchemaFieldTypes.NUMERIC,
    chatQueueLastTamp
  );
  redisService.createRedisJSONIndex(
    "sender",
    SchemaFieldTypes.TAG,
    chatQueueKeyName
  );

  const intervalID = setInterval(op, 10000);

  // async function createRedisJSONIndex(name, type, prefix) {
  //     try {
  //         const fieldName = `$.${name}`
  //         var indexFiled = {}

  //         if (type === SchemaFieldTypes.TEXT) {
  //             indexFiled[fieldName] = {
  //                 type: type,
  //             }
  //         }
  //         else {
  //             indexFiled[fieldName] = {
  //                 type: type,
  //                 AS: name
  //             }
  //         }
  //         await client.ft.create(`idx:${name}`, indexFiled, {
  //             ON: 'JSON',
  //             PREFIX: prefix
  //         });
  //     } catch (e) {
  //         if (e.message === 'Index already exists') {
  //             console.log(`Index exists already, skipped creation.${name}`);
  //         } else {
  //             console.error(e);
  //             process.exit(1);
  //         }
  //     }

  // }
})();

async function op(data) {
  var data_str = `${data.timestamp},${data.senderId},${data.receiverId},${data.mobileId},${data.message}\r\n`;
  queue.enqueue(data_str);
  await client.json.set(`${chatQueueKeyName}:${timestamp}`, "$", data);

  if (last_tamps == "") {
    var q = queue.last().split(",");
    last_tamps = parseInt(q[0]);
  } else {
    val = data.timestamp;
  }
  // }

  if (last_tamps < val) {
    if (cnt > 1) {
      last_tamps = last_tamps + 1;
    }
    const tamp = { timestamp: last_tamps };
    await client.json.set(`${chatQueueLastTamp}`, "$", tamp);
    const results = await client.ft.search(
      "idx:timestamp",
      `@timestamp:[${last_tamps} inf]`
    );
    console.log("last_tamps < val : ", results);
    last_tamps = val;
  }
  queue.clear_queue();
  return cnt;
}

module.exports = {
  op,
};
