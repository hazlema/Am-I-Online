Am I ONLINE?

Quick and dirty NodeJS app to log your connection status.  

Console Output:
```
Am I ONLINE?, v1 - [Logging to: offline.txt]
This queries DNS servers to determine if you are online.  One positive could mean the server is offline
and may not mean that you are offline.  To be sure, multiple failures are the best indicator

2018-12-05 18:16:15: OpenDNS Home (208.67.222.222) says you are ONLINE (31ms)
2018-12-05 18:16:25: Cloudflare (1.1.1.1) says you are ONLINE (24ms)
2018-12-05 18:16:35: FreeDNS (45.33.97.5) says you are ONLINE (52ms)
2018-12-05 18:16:46: Alternate DNS (198.101.242.72) says you are ONLINE (70ms)
2018-12-05 18:16:56: Dyn (216.146.35.35) says you are ONLINE (51ms)
2018-12-05 18:17:06: SafeDNS (195.46.39.39) says you are ONLINE (189ms)
2018-12-05 18:17:16: OpenNIC (198.206.14.241) says you are ONLINE (67ms)
2018-12-05 18:17:26: Yandex DNS (77.88.8.8) says you are ONLINE (224ms)
2018-12-05 18:17:36: UncensoredDNS (91.239.100.100) says you are ONLINE (175ms)
2018-12-05 18:17:46: Hurricane Electric (74.82.42.42) says you are ONLINE (98ms)
```

Log Output:
```
2018-12-05 17:46:03: DNS Watch says you are OFFLINE - (failure 1, Offline for 0m)
2018-12-05 18:22:22: Google (8.8.8.8) says you are OFFLINE (failure 1, Offline for 0m)
2018-12-05 18:22:37: Quad (9.9.9.9) says you are OFFLINE (failure 2, Offline for 0m)
2018-12-05 18:22:52: DNS Watch (84.200.69.80) says you are OFFLINE (failure 3, Offline for 0m)
2018-12-05 18:23:07: Comodo Secure DNS (8.26.56.26) says you are OFFLINE (failure 4, Offline for 0m)
2018-12-05 18:23:22: OpenDNS Home (208.67.222.222) says you are OFFLINE (failure 5, Offline for 0m)
2018-12-05 18:23:37: Cloudflare (1.1.1.1) says you are OFFLINE (failure 6, Offline for 1m)
```

