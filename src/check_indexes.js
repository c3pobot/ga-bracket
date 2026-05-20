import log from './logger.js'
import { gaCache } from './cache.js'

const collections = [
  { collection: 'bracketList', indexes: [
    { key: { TTL: 1 }, opts: { name: '_TTL', expireAfterSeconds: 60 * 24 * 3600 } },
    { key: { groupId: 1 }, opts: { name: '_groupId' } }
  ] },
  { collection: 'metaList', indexes: [
    { key: { TTL: 1 }, opts: { name: '_TTL', expireAfterSeconds: 365 * 24 * 3600 } }
  ] },
  { collection: 'gaEventList', indexes: [
    { key: { TTL: 1 }, opts: { name: '_TTL', expireAfterSeconds: 60 * 24 * 3600 } },
    { key: { league: 1 }, opts: { name: '_league' } }
  ] },
]

async function checkIndex( data ){
  for(let i in data?.indexes){
    let status = await gaCache.updateIndex( data.collection, data.indexes[i].key, data.indexes[i].opts)
    if(!status) return
  }
  return true
}
export default async function(){
  if(!collections || collections.length == 0) return
  for(let i in collections){
    let status = await checkIndex(collections[i])
    if(!status) return
  }
  return true
}
