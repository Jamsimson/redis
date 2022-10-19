const redis = require("redis");
const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
let isConnected = false;

// function start connect to redis
async function getConnection() {
  if (isConnected) {
    console.log();
    return client;
  }
  await client.connect().then(console.log(`Connected..😖`));
  isConnected = true;
  return client;
}

// Queue
var last_tamps = 0;
var val = 0;
var cnt = 0;
// last tamps get and set
function getLastTamps() {
//   console.log(`get lasttamps`, last_tamps);
  return last_tamps+1;
}
function setLastTamps(lasttamps) {
  last_tamps = lasttamps;
  // console.log(`setlasttamps`,this.last_tamps);
}
// val get and set
function getVal() {
//   console.log(`get val`, this.val);
  return val;
}
function setVal(vall) {
  val = vall;
  // console.log(`set val`,this.val);
}
// count get and set
function getCount() {
  return cnt;
}
function setCount(cntt) {
  cnt = cntt + 1;
  return cnt;
}

module.exports = {
  getConnection,
  getLastTamps,
  setLastTamps,
  getVal,
  setVal,
  getCount,
  setCount,
};
