import swgohClient from '../swgoh_client.js'

async function getLastBracketId(groupId, increment, currentNumber = 5){
  let obj = await swgohClient('getLeaderboard', { groupId: `${groupId}:${currentNumber}`, leaderboardType: 4, combatType: 0 })
  if(obj?.leaderboard[0]?.player?.length > 0) return await getLastBracketId(groupId, increment, currentNumber + increment)
  if(increment / 10 >= 1) return await getLastBracketId(groupId, increment/10, currentNumber - increment + (increment/10))
  return currentNumber - increment
}

export default async function(groupId, start = 5){
  return await getLastBracketId(groupId, 1000, start)
}
