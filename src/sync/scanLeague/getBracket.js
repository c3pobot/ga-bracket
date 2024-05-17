'use strict'
const mongo = require('mongoclient')
const remoteMongo = require('src/mongo')
const swgohClient = require('src/swgohClient')
const saveBracket = async(info = {}, bracketId, bracket = {})=>{
  let players = bracket.player?.map(x=>{ return { id: x.id, name: x.name, guildId: x.guild?.id, guildName: x.guild?.name }})
  let tempObj = { players: players, seasonId: info.seasonId, instanceId: info.instanceId, groupId: info.groupId, bracketId: bracketId, league: info.league, startTime: info.startTime, endTime: info.endTime, mode: info.mode, season: info.season, date: info.date, updated: Date.now(), TTL: new Date(info.endTime) }
  let status = await remoteMongo.set('gaPlayers', { _id: `${info.groupId}:${bracketId}` }, tempObj)
  if(!status) return
  await mongo.set('gaPlayers', { _id: `${info.groupId}:${bracketId}` }, tempObj)
  return true
}
module.exports = async(info = {}, bracketId)=>{
  let data = await swgohClient('getLeaderboard', { groupId: info.groupId+':'+bracketId, leaderboardType: 4, combatType: 0 })
  if(!data?.player || data?.player?.length == 0) return
  return await saveBracket(info, bracketId, data)
}
