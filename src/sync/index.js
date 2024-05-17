'use strict'
const log = require('logger')
const swgohClient = require('src/swgohClient')
const checkInstance = require('./checkInstance')

const getEvents = async()=>{
  let events = await swgohClient('getEvents')
  if(!events?.gameEvent || events?.gameEvent?.length == 0) return []
  return events.gameEvent.filter(x=>x.type == 10)
}

module.exports = async()=>{
  try{
    let gaEvents = await getEvents()
    if(!gaEvents || gaEvents?.length == 0) return
    for(let i in gaEvents){
      if(!gaEvents[i]?.instance || gaEvents[i].instance?.length == 0) continue
      await checkInstance(gaEvents[i])
    }
    return true
  }catch(e){
    log.error(e)
  }
}
