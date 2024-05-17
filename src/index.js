'use strict'
const log = require('logger')
log.setLevel('debug');
const mongo = require('mongoclient')
const remoteMongo = require('./mongo')
const sync = require('./sync')
const swgohClient = require('./swgohClient')
const checkMongo = ()=>{
  try{
    let status = mongo.status()
    if(status) log.debug(`local mongo connection ready...`)
    if(status) status = remoteMongo.status()
    if(status) log.debug(`remote mongo connection ready...`)
    if(status){
      checkApi()
      return
    }
    log.debug(`mongo connection(s) not ready....`)
    setTimeout(checkMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMongo, 5000)
  }
}
const checkApi = async()=>{
  try{
    let meta = await swgohClient('metadata')
    if(meta?.latestGamedataVersion){
      log.debug(`Game Api ready...`)
      startSync()
      return
    }
    setTimeout(checkApi, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkApi, 5000)
  }
}
const startSync = async()=>{
  try{
    let syncTime = 5
    let status = await sync()
    if(status) syncTime = 60
    setTimeout(startSync, syncTime * 1000)
  }catch(e){
    log.error(e)
    setTimeout(startSync, 5000)
  }
}
checkMongo()
