import log from '../logger.js'
import { eachLimit } from 'async'
import { gaCache } from '../cache.js'
import getLastBracketId from './get_last_bracket_id.js'
import getBracket from './get_bracket.js'

export default async function(groupId){
  try{
    if(!groupId) return

    let foundNewLastBracketId
    let gaEvent = await gaCache.get('gaEventList', { _id: groupId }, { _id: 0, TTL: 0 })
    if(!gaEvent?.groupId) return

    let lastBracketId = await getLastBracketId(groupId, 5)
    if(!lastBracketId || lastBracketId < 0) return
    if(!gaEvent.lastBracketId) foundNewLastBracketId = true
    if(gaEvent.lastBracketId && lastBracketId !== gaEvent?.lastBracketId && lastBracketId > gaEvent?.lastBracketId) foundNewLastBracketId = true
    if(foundNewLastBracketId){
      log.info(`found new lastBracketId of ${lastBracketId} for ${groupId}`)
      await gaCache.set('gaEventList', { _id: groupId }, { lastBracketId })
    }
    let bracketIds = [...Array(+lastBracketId + 1).keys()]
    if(!bracketIds || bracketIds?.length == 0) return

    let brackets = (await gaCache.all('bracketList', { groupId: groupId }, { _id: 0, bracketId: 1 }))?.map(x=>x.bracketId)
    if(!brackets) brackets = []
    let missing = bracketIds.filter(x=>!brackets.includes(x))
    log.info(`missing ${missing?.length || 0 }/${lastBracketId + 1} brackets for ${groupId}`)
    let startTime = Date.now(), count = 0, found = 0
    await eachLimit(missing, 80, async(bracketId)=>{
      count++
      let status = await getBracket(gaEvent, bracketId)
      if(status) found++
    })
    log.info(`finished scan of ${groupId} found ${found}/${count} brackets in ${((Date.now() - startTime) / 1000)?.toFixed(2)} seconds...`)
  }catch(e){
    log.error(e)
  }
}
