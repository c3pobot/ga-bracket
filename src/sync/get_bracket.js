import { gaCache } from '../cache.js'
import swgohClient from '../swgoh_client.js'
function sleep(ms = 5000){
  return new Promise((resolve)=>{
    setTimeout(resolve, ms)
  })
}
async function saveBracket(gaEvent, bracketId, bracket){
  if(!gaEvent?.groupId || !bracket?.player || bracket?.player?.length == 0) return
  let players = bracket.player?.map(x=>{ return { id: x.id, name: x.name, guildId: x.guild?.id, guildName: x.guild?.name }})
  let playerIds = bracket.player.map(x=>x.id)
  let tempObj = {
    players, playerIds, seasonId: gaEvent.seasonId, instanceId: gaEvent.instanceId, groupId: gaEvent.groupId, bracketId: bracketId, league: gaEvent.league, startTime: gaEvent.startTime,
    endTime: gaEvent.endTime, mode: gaEvent.mode, season: gaEvent.season, date: gaEvent.date, updated: Date.now(), TTL: new Date(gaEvent.endTime)
  }
  return await gaCache.set('bracketList', { _id: `${gaEvent.groupId}:${bracketId}` }, tempObj)
}
export default async function(gaEvent, bracketId){
  let data = await swgohClient('getLeaderboard', { groupId: `${gaEvent.groupId}:${bracketId}`, leaderboardType: 4, combatType: 0 })
  let player = data?.leaderboard[0]?.player
  if(!player || player?.length == 0) return
  await sleep()
  return await saveBracket(gaEvent, bracketId, { player: player })
}
