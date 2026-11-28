export const GPS_FRESH_MS=120000;
export function validCoordinates(lat:unknown,lon:unknown):boolean{return typeof lat==="number"&&typeof lon==="number"&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;}
export function freshPosition(t:{latitude?:number|null;longitude?:number|null;locationUpdatedAt?:Date|string|null},now=Date.now()){const ms=t.locationUpdatedAt?new Date(t.locationUpdatedAt).getTime():0;return validCoordinates(t.latitude,t.longitude)&&ms>0&&now-ms>=0&&now-ms<=GPS_FRESH_MS;}
export function distanceKm(a:number,b:number,c:number,d:number){const rad=(x:number)=>x*Math.PI/180;const h=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));}
