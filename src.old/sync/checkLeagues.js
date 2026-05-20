'use strict'
const mongo = require('mongoclient')
const scanLeague = require('./scanLeague')
module.exports = async(gaEvent = {})=>{
  if(!gaEvent?.leagues) return
  for(let i in gaEvent.leagues){
    if(!gaEvent.leagues[i]) continue
    await scanLeague({ ...JSON.parse(JSON.stringify(gaEvent)),...gaEvent.leagues[i] })
  }
}
