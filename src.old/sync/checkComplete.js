'use strict'
const log = require('logger')
const mongo = require('mongoclient')
module.exports = async(id)=>{
  let gaEvent = (await mongo.find('gaEvents', { _id: id }))[0]
  if(!gaEvent) return
  let count = 0, done = 0
  for(let i in gaEvent.leagues){
    if(!gaEvent.leagues[i] || !gaEvent.leagues[i]?.groupId) continue
    count++
    let brackets = await mongo.find('gaPlayers', { groupId: gaEvent.leagues[i]?.groupId}, { groupId: 1})
    if(brackets?.length && gaEvent.leagues[i]?.lastBracketId && brackets?.length === gaEvent.leagues[i].lastBracketId + 1) done++
  }
  if(count > 0 && count == done){
    await mongo.set('gaEvents', { _id: id}, { leaderboardScanComplete: true, TTL: gaEvent.TTL })
    log.info(`Closed leadboard scan for ${gaEvent.season} date ${gaEvent.date}...`)
  }
}
