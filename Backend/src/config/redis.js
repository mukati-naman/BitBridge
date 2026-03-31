const {createClient}=require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-11704.c305.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 11704
    }
});

module.exports=redisClient;