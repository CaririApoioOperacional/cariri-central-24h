export function newProtocol(){const y=new Date().getFullYear();const tail=crypto.randomUUID().replace(/-/g,"").slice(0,8).toUpperCase();return `CAR-${y}-${tail}`}
