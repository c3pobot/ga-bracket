'use strict'
const log = require('logger')
const { eachLimit } = require('async')
const mongo = require('mongoclient')
const getLastBracketId = require('./getLastBracketId')
const getBracket = require('./getBracket')
module.exports = async(info = {})=>{
  let lastBracketId = await getLastBracketId(info.eventInstanceId, info.league, info.lastBracketId || 5)
  if(!lastBracketId) return
  if(lastBracketId !== info.lastBracketId){
    await mongo.set('gaEvents', { _id: info.eventInstanceId }, { [`leagues.${info.league}.lastBracketId`]: lastBracketId || 0})
    log.debug(`found new lastBracketId for ${info.league} season ${info.season} of ${lastBracketId}`)
  }
  let bracketIds = [...Array(+lastBracketId + 1).keys()]
  if(!bracketIds || bracketIds?.length == 0) return
  let brackets = await mongo.find('gaPlayers', { groupId: info.groupId }, { groupId:1, bracketId: 1 })
  brackets = brackets?.map(x=>x.bracketId) || []
  if(!brackets) brackets = []
  let missing = bracketIds.filter(x=>!brackets.includes(x))
  log.debug(`missing ${missing?.length || 0 }/${lastBracketId + 1} brackets for ${info.league} season ${info.season}`)
  if(!missing || missing.length == 0) return
  let startTime = Date.now(), count = 0, found = 0
  await eachLimit(missing, 80, async(bracketId)=>{
    count++
    let status = await getBracket(info, bracketId)
    if(status) found++
  })
  let scanTime = (Date.now() - startTime) / 1000
  log.debug(`finished scan of ${info.league} season ${info.season} found ${found}/${count} brackets...`)
}
