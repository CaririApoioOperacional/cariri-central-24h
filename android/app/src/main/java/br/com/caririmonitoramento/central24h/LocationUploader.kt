package br.com.caririmonitoramento.central24h

import android.content.Context
import android.webkit.CookieManager
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

object LocationUploader{
 private val io=Executors.newSingleThreadExecutor()
 private const val endpoint="https://cariri-central-24h-production.up.railway.app/api/technicians/location"
 fun enqueue(context:Context,lat:Double,lon:Double){io.execute{send(lat,lon)}}
 private fun send(lat:Double,lon:Double){
  try{
   val u=URL(endpoint);val c=(u.openConnection() as HttpURLConnection)
   c.requestMethod="POST";c.connectTimeout=10000;c.readTimeout=10000;c.doOutput=true
   c.setRequestProperty("Content-Type","application/json")
   val cookie=CookieManager.getInstance().getCookie("https://cariri-central-24h-production.up.railway.app")
   if(!cookie.isNullOrBlank())c.setRequestProperty("Cookie",cookie) else return
   c.outputStream.use{it.write("""{"latitude":$lat,"longitude":$lon}""".toByteArray())}
   c.inputStream.use{it.readBytes()}
   c.disconnect()
  }catch(_:Exception){}
 }
}
