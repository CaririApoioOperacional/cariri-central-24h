package br.com.caririmonitoramento.central24h

import android.app.*
import android.content.*
import android.media.RingtoneManager
import android.os.IBinder
import androidx.core.app.NotificationCompat
import android.webkit.CookieManager
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class DispatchWatcher:Service(){
 companion object{const val CHANNEL="cariri_despachos";const val SERVICE_CHANNEL="cariri_despachos_servico";const val SERVICE_ID=25}
 private val io=Executors.newSingleThreadExecutor()
 private var running=true
 private val known=mutableSetOf<String>()
 override fun onCreate(){
  super.onCreate()
  val nm=getSystemService(NotificationManager::class.java)
  nm.createNotificationChannel(NotificationChannel(CHANNEL,"Novos despachos",NotificationManager.IMPORTANCE_HIGH))
  nm.createNotificationChannel(NotificationChannel(SERVICE_CHANNEL,"CARIRI Despachos",NotificationManager.IMPORTANCE_LOW))
  val pi=PendingIntent.getActivity(this,25,Intent(this,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  val serviceNotification=NotificationCompat.Builder(this,SERVICE_CHANNEL).setSmallIcon(android.R.drawable.ic_popup_sync).setContentTitle("CARIRI CENTRAL 24h").setContentText("Monitorando novos despachos").setOngoing(true).setContentIntent(pi).build()
  startForeground(SERVICE_ID,serviceNotification)
  io.execute{while(running){check();try{Thread.sleep(8000)}catch(_:Exception){}}}
 }
 private fun check(){
  try{
   val c=URL("https://cariri-central-24h-production.up.railway.app/api/dispatches").openConnection() as HttpURLConnection
   c.connectTimeout=10000;c.readTimeout=10000
   val cookie=CookieManager.getInstance().getCookie("https://cariri-central-24h-production.up.railway.app")?:return
   c.setRequestProperty("Cookie",cookie)
   if(c.responseCode!=200)return
   val a=JSONArray(c.inputStream.bufferedReader().readText())
   for(i in 0 until a.length()){val d=a.getJSONObject(i);val id=d.getString("id");val status=d.optString("status");if(status=="SENT"&&!known.contains(id)){if(known.isNotEmpty())notifyDispatch(d);known.add(id)}else known.add(id)}
  }catch(_:Exception){}
 }
 private fun notifyDispatch(d:org.json.JSONObject){
  val ev=d.optJSONObject("event");val protocol=ev?.optString("protocol")?:"Novo atendimento";val site=ev?.optJSONObject("site")?.optString("name")?:""
  val pi=PendingIntent.getActivity(this,24,Intent(this,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  val n=NotificationCompat.Builder(this,CHANNEL).setSmallIcon(android.R.drawable.ic_dialog_alert).setContentTitle("NOVO DESPACHO • $protocol").setContentText(site).setPriority(NotificationCompat.PRIORITY_HIGH).setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)).setVibrate(longArrayOf(0,350,180,350)).setAutoCancel(true).setContentIntent(pi).build()
  getSystemService(NotificationManager::class.java).notify(idHash(d.getString("id")),n)
 }
 private fun idHash(s:String)=s.hashCode() and 0x7fffffff
 override fun onDestroy(){running=false;io.shutdownNow();super.onDestroy()}
 override fun onBind(intent:Intent?):IBinder?=null
}
