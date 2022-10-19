(async () => {
  const redis = require("redis");
  const { SchemaFieldTypes } = redis;
  const { createClient } = redis;
  SerialPort = require("serialport");
  ReadlineParser = require("@serialport/parser-readline");
  var msg = "";
  var last_tamps = "";
  let old_temps = 0;
  const intervalID = setInterval(main, 5000);

  async function main() {
    const client = createClient();
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();

    try {
      last_tamps = await client.ft.search("idx:last_timestamp", `*`);
      console.log(last_tamps);
      last_tamps = last_tamps.documents[0].value.timestamp; // { total: 1, documents: [ { id: 'system:outGoing', value: [Object] } ] } // { timestamp: 166xxxxxxx }
      // console.log(last_tamps);
      // console.log(old_temps);
      if (old_temps != last_tamps || old_temps == 0) {
        old_temps = last_tamps;
        let results = await client.ft.search(
          "idx:timestamp",
          `@timestamp:[${last_tamps} inf]`
        );
       
        
        //for (let index = 0; index < results.total; index++) {
         // msg = `${results.documents[index].id},${results.documents[index].value.senderId},${results.documents[index].value.receiverId},${results.documents[index].value.mobileId},${results.documents[index].value.message}`;
          //console.log(`index ${index + 1}: ${msg}`);
          //write msg to skywave
          // var port = new SerialPort({ path: 'COM17', baudRate: 9600 })
          //const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
          // port.write(msg)
       // }
      } else {
        console.log("no new value");
      }
    } catch (e) {
      if (
        e.message === "idx:last_timestamp: no such index" ||
        e.message === "Cannot read properties of undefined (reading 'value')"
      ) {
        console.log(`no index yet`);
      } else {
        console.log(e);
        process.exit(1);
      }
    }
  }
})();
