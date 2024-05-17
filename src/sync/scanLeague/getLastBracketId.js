'use strict'
const { each } = require('async');
const swgohClient = require('src/swgohClient')
const getLastBracketId = async(eventInstanceId, league, increment = 1000, currentNumber = 5)=>{
  let obj = await swgohClient('getLeaderboard', {groupId: eventInstanceId+':'+league+':'+currentNumber, leaderboardType: 4, combatType: 0})
  if(obj.player?.length > 0) return await getLastBracketId(eventInstanceId, league, increment, currentNumber + increment)
  if(increment / 10 >= 1) return await getLastBracketId(eventInstanceId, league, increment/10, currentNumber - increment + (increment/10))
  return currentNumber - increment
}
module.exports = async(eventInstanceId, league, start = 5)=>{
  return await getLastBracketId(eventInstanceId, league, 1000, start)
}
