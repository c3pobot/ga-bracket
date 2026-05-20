import log from '../logger.js'
import { gaCache } from '../cache.js'
const leagues = ['KYBER', 'AURODIUM', 'CHROMIUM', 'BRONZIUM', 'CARBONITE']

async function getLeaguePlayerCount(groupId){
  let brackets = await gaCache.all('bracketList', { groupId: groupId }, { _id: 0, playerIds: 1 })
  if(!brackets || brackets?.length == 0) return

  let playerIds = brackets.flatMap(x=>x?.playerIds?.map(p=>p))
  return playerIds?.length
}
async function checkEvent(groupId){
  let gaEvent = await gaCache.get('gaEventList', { _id: groupId }, { _id: 0, bracketScanComplete: 1, date: 1, startTime: 1, endTime: 1, mode: 1, season: 1, eventInstanceId: 1 })
  if(!gaEvent?.eventInstanceId) return

  delete gaEvent.TTL
  let counts = {}, total = 0
  for(let i in leagues){
    let playerCount = await getLeaguePlayerCount(`${gaEvent.eventInstanceId}:${leagues[i]}`)
    counts[leagues[i]] = playerCount || 0
    total += playerCount || 0
  }
  gaEvent.scancomplete = gaEvent.bracketScanComplete, gaEvent.total = total, gaEvent.counts = counts
  await gaCache.set('metaList', { _id: gaEvent.eventInstanceId }, gaEvent)
  if(gaEvent.bracketScanComplete) await gaCache.set('gaEventList', { _id: groupId }, { metaComplete: true })
}
export default async function(){
  try{
    let kyberEvents = await gaCache.all('gaEventList', { league: 'KYBER' }, { _id: 0, groupId: 1, metaComplete: 1 })
    if(!kyberEvents || kyberEvents?.length == 0) return

    let groupIds = kyberEvents.filter(x=>!x.metaComplete)?.map(x=>x.groupId)
    if(!groupIds || groupIds?.length == 0) return
    for(let i in groupIds) await checkEvent(groupIds[i])
  }catch(e){
    log.error(e)
  }
}
