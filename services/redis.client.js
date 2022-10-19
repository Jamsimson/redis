const redis = require("redis");
const client = redis.createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
let isConnected = false

// function start connect to redis
async function getConnection() {
    if(isConnected){
        console.log();
        return client
    } 
    await client.connect().then(console.log(`Connected..😖`));
    isConnected = true
    return client;
}

module.exports = {
    getConnection
};
