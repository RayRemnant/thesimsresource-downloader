const { Redis } = require('@upstash/redis')

const redis = new Redis({
    url: 'https://eu2-busy-grouse-30712.upstash.io',
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

module.exports = redis