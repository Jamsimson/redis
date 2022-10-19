let serviceInterval = null

const startService = async (interval) => {

    serviceInterval = setInterval(() => {

        console.log('Send message to satellite');
        
    }, interval);

}

const stopService = async () => {

    serviceInterval = clearInterval(serviceInterval)
    console.log('Service stopped');

}


module.exports = {
    startService,
    stopService
};



