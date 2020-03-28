module.exports = (service_type, service_name)=>{
  const VCAP = JSON.parse(process.env.VCAP_SERVICES)

  // Verifiy that server is passed in
  if ( !VCAP[service_type] || VCAP[service_type].length<1 ) {
    throw `${service_type} service ${service_name} not found in VCAP_SERVICES`
  }

  // Verify that server is passed in part two
  const server_service = VCAP[service_type].find((svc)=>(svc.name===service_name))
  if ( !server_service ) {
    throw `${service_type} service ${service_name} not found in VCAP_SERVICES`
  }

  return server_service.credentials
}