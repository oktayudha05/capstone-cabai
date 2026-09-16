# Kontrak MQTT: dashboard pemantauan cabai

Dokumen ini adalah kesepakatan topik antara firmware mikrokontroler dan dashboard web. Firmware yang publish, dashboard hanya subscribe. Dashboard tidak pernah mengirim perintah on/off.

Prefix topik: `capstone/cabai` (diatur lewat `VITE_MQTT_TOPIC_PREFIX`).

Broker: HiveMQ public broker, `broker.hivemq.com`.

| Kanal | Koneksi | Port |
| --- | --- | --- |
| TCP | `broker.hivemq.com` | 1883 |
| TCP + TLS | `broker.hivemq.com` | 8883 |
| WebSocket | `broker.hivemq.com` | 8000, path `/mqtt` |
| WebSocket + TLS | `broker.hivemq.com` | 8884, path `/mqtt` |

Dashboard di browser memakai WebSocket, jadi defaultnya `wss://broker.hivemq.com:8884/mqtt`. Firmware ESP32 bisa memakai TCP 1883, atau 8883 kalau memakai TLS.

Peringatan: broker publik HiveMQ tidak memakai autentikasi dan topiknya bisa dibaca siapa saja. Jangan publish data pribadi atau kredensial lewat topik ini.

## Topik

| Topik | Arah | QoS | Retained | Payload |
| --- | --- | --- | --- | --- |
| `capstone/cabai/sensor/soil-moisture` | firmware publish | 0 | disarankan ya | kelembapan tanah, persen 0 sampai 100 |
| `capstone/cabai/sensor/air-humidity` | firmware publish | 0 | disarankan ya | kelembapan udara, persen 0 sampai 100 |
| `capstone/cabai/actuator/fan` | firmware publish | 0 | disarankan ya | status kipas |
| `capstone/cabai/actuator/pump` | firmware publish | 0 | disarankan ya | status pompa air |
| `capstone/cabai/status` | firmware publish | 1 | ya | `online` saat connect, `offline` lewat last will |

Retained dianjurkan supaya dashboard langsung punya nilai terakhir begitu dibuka, tanpa menunggu publish berikutnya.

## Format payload

Kedua format diterima. Parser dashboard memilih berdasarkan karakter pertama payload.

Sensor, scalar:

```
63.5
```

Sensor, JSON:

```json
{"value": 63.5, "ts": 1737000000000}
```

Alias `moisture` dan `humidity` juga diterima sebagai pengganti `value`. `ts` boleh dihilangkan; dashboard akan memakai jam lokal browser kalau kosong.

Aktuator, scalar:

```
on
```

Aktuator, JSON:

```json
{"state": "on", "ts": 1737000000000}
```

Nilai yang dianggap menyala: `on`, `1`, `true`, `nyala`. Nilai yang dianggap mati: `off`, `0`, `false`, `mati`. Payload lain diabaikan dan dashboard menandai aktuator sebagai belum ada data.

## Contoh firmware ESP32

Memakai PubSubClient. Potongan ini untuk laporan, sesuaikan pin dan sensor dengan rangkaian sebenarnya.

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* MQTT_HOST = "broker.hivemq.com";
const int   MQTT_PORT = 1883;
const char* TOPIC_SOIL = "capstone/cabai/sensor/soil-moisture";
const char* TOPIC_AIR  = "capstone/cabai/sensor/air-humidity";
const char* TOPIC_FAN  = "capstone/cabai/actuator/fan";
const char* TOPIC_PUMP = "capstone/cabai/actuator/pump";
const char* TOPIC_STATUS = "capstone/cabai/status";

WiFiClient net;
PubSubClient mqtt(net);

void publishReading(const char* topic, float percent) {
  char buf[16];
  dtostrf(percent, 0, 1, buf);
  mqtt.publish(topic, buf, true);  // retained
}

void loop() {
  mqtt.loop();
  publishReading(TOPIC_SOIL, bacaKelembapanTanah());
  publishReading(TOPIC_AIR, bacaKelembapanUdara());
  mqtt.publish(TOPIC_FAN, kipasNyala ? "on" : "off", true);
  mqtt.publish(TOPIC_PUMP, pompaNyala ? "on" : "off", true);
  delay(2000);
}
```

## Menguji tanpa perangkat

Jalankan dashboard dengan `VITE_DATA_SOURCE=dummy`, simulator lokal mengisi nilai yang berfluktuasi tiap detik. Untuk menguji jalur MQTT tanpa firmware, publish manual:

```bash
mosquitto_pub -h broker.hivemq.com -t capstone/cabai/sensor/soil-moisture -m 58.4 -r
mosquitto_pub -h broker.hivemq.com -t capstone/cabai/actuator/pump -m on -r
```

Lalu set `VITE_DATA_SOURCE=mqtt` di `.env` dan restart `npm run dev`.
