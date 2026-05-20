import log from '../logger.js'
import { gaCache } from '../cache.js'
import checkEvent from './check_event.js'
import updateMetaList from './update_meta_list.js'
async function sync(){
  try{
    let gaEvents = (await gaCache.all('gaEventList', {}, { _id: 0, groupId: 1, bracketScanComplete: 1, startTime: 1, endTime: 1 }))?.filter(x=>!x.bracketScanComplete)
    let timeNow = Date.now()
    for(let i in gaEvents){

      if(!gaEvents[i].groupId || !gaEvents[i].endTime || !gaEvents[i].startTime) continue
      if(gaEvents[i].endTime < timeNow) await gaCache.set('gaEventList', { _id: gaEvents[i].groupId }, { bracketScanComplete: true })
      if(gaEvents[i].startTime < timeNow) await checkEvent( gaEvents[i].groupId )
    }
    await updateMetaList()
    setTimeout(sync, 5000)
  }catch(e){
    log.error(e)
    setTimeout(sync, 5000)
  }
}
export default {
  start: sync
}
