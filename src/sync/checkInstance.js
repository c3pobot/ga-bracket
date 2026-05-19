'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const checkLeagues = require('./checkLeagues')
const checkComplete = require('./checkComplete')
const leagues = ['KYBER', 'AURODIUM', 'CHROMIUM', 'BRONZIUM', 'CARBONITE']

const getMode = (mapId)=>{
  if(!mapId) return
  if(mapId.includes('3v3')) return '3v3'
  return '5v5'
}
const getSeason = (seasonId)=>{
  let array = seasonId.split('_'), id
    let season = array[+array.length - 1]
    for(let i=0;i < season.length;i++){
      if(+season.charAt(i) >= 0){
        if(!id) id = ''
        id += season.charAt(i)
      }
    }
    if(id) return +id
}
const formatEvent = (gaEvent = {}, instance = {})=>{
  let res = { id: `${gaEvent.id}:${instance.id}`, eventInstanceId: `${gaEvent.id}:${instance.id}`, instanceId: instance.id, seasonId: gaEvent.id, startTime: +instance.startTime,  endTime: +instance.endTime, leagues: {}, season: getSeason(gaEvent.id), mode: getMode(gaEvent.territoryMapId), date: new Date(+instance.startTime).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'numeric', day: 'numeric', year: 'numeric' }), TTL: new Date(+instance.endTime) }
  res.key = `${res.season}-${res.date?.replace(/\//g, '-')}`
  for(let i in leagues) res.leagues[leagues[i]] = { league: leagues[i], totalPlayer: 0, groupId: `${res.eventInstanceId}:${leagues[i]}` }
  return res
}
const getEvent = async(gaEvent = {}, instance = {})=>{
  if(!instance.id) return
  let exists = (await mongo.find('gaEvents', { _id: `${gaEvent.id}:${instance.id}` }, { _id: 0}))[0]
  if(exists?.eventInstanceId) return exists

  let tempEvent = formatEvent(gaEvent, instance)
  if(!tempEvent?.id) return

  await mongo.set('gaEvents', { _id: tempEvent.eventInstanceId }, tempEvent)
  return tempEvent
}
const updateMeta = async(eventInstanceId)=>{
  let data = (await mongo.find('gaEvents', { _id: eventInstanceId }))[0]
  if(!data?.eventInstanceId) return
  let counts = {
    KYBER: (data?.leagues?.KYBER?.lastBracketId + 1 || 0) * 8,
    AURODIUM: (data?.leagues?.AURODIUM?.lastBracketId + 1 || 0) * 8,
    CHROMIUM: (data?.leagues?.CHROMIUM?.lastBracketId + 1 || 0) * 8,
    BRONZIUM: (data?.leagues?.BRONZIUM?.lastBracketId + 1 || 0) * 8,
    CARBONITE: (data?.leagues?.CARBONITE?.lastBracketId + 1 || 0) * 8
  }
  let totalCount = (counts.KYBER || 0) + (counts.AURODIUM || 0) + (counts.CHROMIUM || 0) + (counts.BRONZIUM || 0) + (counts.CARBONITE || 0)
  await mongo.set('meta', { _id: 'ga-signups' }, { [data.id]: { id: data.id, date: data.date, startTime: data.startTime, endTime: data.endTime, scancomplete: data.leaderboardScanComplete, mode: data.mode, season: data.season, total: totalCount || 0, counts: counts }} )
}
module.exports = async(gaEvent = {})=>{
  let timeNow = Date.now()
  for(let i in gaEvent.instance){
    let tempEvent = await getEvent(gaEvent, gaEvent.instance[i])
    if(!tempEvent?.id) return
    if(tempEvent.leaderboardScanComplete) continue
    if(tempEvent.startTime > timeNow) continue
    await checkLeagues(tempEvent)
    await updateMeta(tempEvent.eventInstanceId)
    if(timeNow > tempEvent.endTime && tempEvent.id) await checkComplete(tempEvent.id)
  }
}
