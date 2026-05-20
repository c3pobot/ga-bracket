import MongoCache from 'mongo-cache'

export const dataCache = new MongoCache({
  connection_string: 'mongodb://mongo-data-rs2.datastore.svc.cluster.local?replicaSet=rs2&ssl=false&compressors=snappy&retryReads=true&retryWrites=true',
  db_name: 'game_data'
})
export const gaCache = new MongoCache({
   connection_string: 'mongodb://mongo-ga-rs1.datastore.svc.cluster.local:27018?replicaSet=rs1&ssl=false&compressors=snappy&retryReads=true&retryWrites=true',
   db_name: 'ga_data'
})
function status(){
  let status = dataCache.status()
  if(!status) return
  return gaCache.status()
}
export default { status }
