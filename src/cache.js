import { MongoCache } from 'mongo-cache'

export const gaCache = new MongoCache({
   connection_string: 'mongodb://mongo-ga-rs1.datastore.svc.cluster.local:27018?replicaSet=rs1&ssl=false&compressors=snappy&retryReads=true&retryWrites=true',
   db_name: 'ga_data'
})

function status(){
  return gaCache.status()
}
export default { status }
