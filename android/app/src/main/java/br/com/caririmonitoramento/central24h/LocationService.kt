package br.com.caririmonitoramento.central24h

import android.app.*
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat

class LocationService:Service(){
 companion object{const val CHANNEL="cariri_operacao"}
 override fun onCreate(){
  super.onCreate()
  val nm=getSystemService(NotificationManager::class.java)
  nm.createNotificationChannel(NotificationChannel(CHANNEL,"CARIRI Operação",NotificationManager.IMPORTANCE_LOW))
  val i=Intent(this,MainActivity::class.java)
  val pi=PendingIntent.getActivity(this,0,i,PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  val n=NotificationCompat.Builder(this,CHANNEL).setContentTitle("CARIRI CENTRAL 24h").setContentText("Operação ativa").setSmallIcon(android.R.drawable.ic_menu_mylocation).setOngoing(true).setContentIntent(pi).build()
  startForeground(24,n)
 }
 override fun onBind(intent:Intent?):IBinder?=null
}
