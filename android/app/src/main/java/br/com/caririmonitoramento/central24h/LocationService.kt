package br.com.caririmonitoramento.central24h

import android.Manifest
import android.app.*
import android.content.Intent
import android.content.pm.PackageManager
import android.os.IBinder
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*

class LocationService:Service(){
 companion object{const val CHANNEL="cariri_operacao";const val ID=24}
 private lateinit var client:FusedLocationProviderClient
 private lateinit var callback:LocationCallback
 override fun onCreate(){
  super.onCreate()
  getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel(CHANNEL,"CARIRI Operação",NotificationManager.IMPORTANCE_LOW))
  val pi=PendingIntent.getActivity(this,0,Intent(this,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  val n=NotificationCompat.Builder(this,CHANNEL).setContentTitle("CARIRI CENTRAL 24h").setContentText("Localização operacional ativa").setSmallIcon(android.R.drawable.ic_menu_mylocation).setOngoing(true).setContentIntent(pi).build()
  startForeground(ID,n)
  client=LocationServices.getFusedLocationProviderClient(this)
  callback=object:LocationCallback(){override fun onLocationResult(r:LocationResult){r.lastLocation?.let{LocationUploader.enqueue(this@LocationService,it.latitude,it.longitude)}}}
  startLocation()
 }
 private fun startLocation(){
  if(ActivityCompat.checkSelfPermission(this,Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED)return
  val req=LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY,15000L).setMinUpdateIntervalMillis(8000L).setMinUpdateDistanceMeters(10f).build()
  client.requestLocationUpdates(req,callback,mainLooper)
 }
 override fun onDestroy(){if(::client.isInitialized&&::callback.isInitialized)client.removeLocationUpdates(callback);super.onDestroy()}
 override fun onBind(intent:Intent?):IBinder?=null
}
