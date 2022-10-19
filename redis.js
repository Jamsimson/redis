// Set redis database
const redis = require("redis");
const { faker } = require("@faker-js/faker");
const client = redis.createClient();
const { SchemaFieldTypes } = redis;

async function redisConnect() {
  console.log(`😖Hello World!!`);

  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect().then(console.log(`Connected..🚀🚀`));

  const chatQueueKeyName = "etneca:store";
  //Set redis and suppose data insite
  for (let index = 0; index < 5; index++) {
    const timestamp = Date.now();
    const data = {
      timestamp: timestamp,
      app_id: 001,
      SOS: false,
      message:
        // suppose
        {
          senderID: faker.datatype.uuid(),
          receiverID: faker.datatype.uuid(),
          mes: faker.lorem.paragraph(),
        },
    };
    // console.log("🚀 ~ data", data)
    await client.json.set(`${chatQueueKeyName}:${timestamp}`, "$", data);
  }
  // test append data[6]
  const timestampArr = Date.now();
  const dataArr = {
    timestamp: timestampArr,
    app_id: 001,
    SOS: false,
    message: {
      sender_accounts: "5c7072a835c3b",
      balance: 100,
      receiver_accounts: "5c7696db0745b",
    },
  };
  await client.json
    .set(`${chatQueueKeyName}:${timestampArr}`, "$", dataArr)
    .then(console.log(`Successfully[6]🎉🎉🎉 Your data has append now`));
  // test append data[7]
  const timestampArr7 = 15978654;
  const dataArr7 = {
    timestamp: timestampArr7,
    app_id: 002,
    SOS: true,
    message: {
      userID: faker.datatype.uuid(),
      boardID: "PK-32415",
      location: faker.address.city(),
    },
  };
  await client.json
    .set(`${chatQueueKeyName}:${timestampArr7}`, "$", dataArr7)
    .then(console.log(`Successfully[7]🎉🎉🎉 Your data has append now`));

  // Create form search
  await client.ft.create(
    "idx:timestamp",
    {
      timestamp: SchemaFieldTypes.NUMERIC,
      app_id: SchemaFieldTypes.NUMERIC,
    },
    {
      ON: "JSON",
      PREFIX: chatQueueKeyName,
    }
  );
  // const results = await client.ft.search(
  //   "idx:timestamp",
  //   "@timestamp:[15978654 inf]"
  // );
  console.log(`Search results:🔍`, results);

  createRedisJSONIndex("timestamp", SchemaFieldTypes.NUMERIC, chatQueueKeyName);
  async function createRedisJSONIndex(name, type, prefix) {
    try {
      const fieldName = `$.${name}`;
      var indexFiled = {};

      if (type === SchemaFieldTypes.TEXT) {
        indexFiled[fieldName] = {
          type: type,
        };
        console.log("already sender text ");
      } else {
        indexFiled[fieldName] = {
          type: type,
          AS: name,
        };
      }

      console.log(
        "🚀 ~ createRedisJSONIndex ~ indexFiled",
        JSON.stringify(indexFiled)
      );

      await client.ft.create(`idx:${name}`, indexFiled, {
        ON: "JSON",
        PREFIX: prefix,
      });
    } catch (e) {
      if (e.message === "Index already exi dfewszxests") {
        console.log(`Index exists already, skipped creation.${name}`);
      } else {
        // Something went wrong, perhaps RediSearch isn't installed...
        console.error(e);
        process.exit(1);
      }
    }
  }
  const results2 = await client.ft.search('idx:timestamp', '@timestamp:[1662719807006 inf]');
    console.log("🚀 ~ results", results2)
}
redisConnect();
