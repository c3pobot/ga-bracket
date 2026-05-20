import log from './logger.js'
import cache from './cache.js'
import swgohClient from './swgoh_client.js'
import sync from './sync/index.js'
import checkIndexes from './check_indexes.js'

async function checkGameClient(){
  try{
    let data = await swgohClient('metadata')
    if(data?.latestGamedataVersion){
      log.info(`game client connected...`)
      return checkCache()
    }
    setTimeout(checkGameClient, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkGameClient, 5000)
  }
}
function checkCache(){
  try{
    let status = cache.status()
    if(status){
      log.info(`cache is ready...`)
      return updateIndexes()
    }
    setTimeout(checkCache, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkCache, 5000)
  }
}
async function updateIndexes(){
  try{
    let status = await checkIndexes()
    if(status){
      log.info(`cache indexes ready...`)
      return sync.start()
    }
    setTimeout(updateIndexes, 5000)
  }catch(e){
    log.error(e)
    setTimeout(updateIndexes, 5000)
  }
}
checkGameClient()
