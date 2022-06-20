# Running Graphite and Grafana at the same time

Within the community, it's popular to run Grafana to track statsd statistcs from goesrecv. The problem is, Goesrecv only supports sending statsd statistics to one statsd host at a time, and Vitality GOES uses graphite/statsd as its statsd handler. This begs the question: if you want to have statistics in both Vitality GOES and Grafana, how do you do that?

The solution is to use an alternative configuration for graphite/statsd, along with a helper service. No changes are needed to your Grafana setup. For simplicity, these instructions assume you have goesrecv, Grafana, and graphite/statsd all running on the same machine. Here are the steps:

1. Modify the `[monitor]` section of your goesrecv.conf file to look like this (don't forget to restart goesrecv afterwards):

   ```
   [monitor]
   statsd_address = "udp4://127.0.0.1:8325"
   ```
3. Copy [extra/statsdduplicator.service](/extra/statsdduplicator.service) from this repo to /usr/lib/systemd/system/statsdsplitter.service on your ground station machine
4. Run the following commands **as root**:
    ```
    systemctl daemon-reload
    systemctl enable statsdduplicator
    systemctl start statsdduplicator
    ```
6. Follow the normal steps in the readme under [Preparing your system for Vitality GOES > Graphite/statsd](/readme.md#graphitestatsd). The only difference is that you will want to use this command instead for step 4:
   ```
   docker run -d\
    --name graphite\
    --restart=always\
    -p 8080:80\
    -p 8225:8125/udp\
    -p 8126:8126\
    -v /var/lib/graphite/config:/opt/graphite/conf\
    -v /var/lib/graphite/data:/opt/graphite/storage\
    -v /var/lib/graphite/statsd_config:/opt/statsd/config\
    -v /var/lib/graphite/log:/var/log\
    graphiteapp/graphite-statsd
   ```

## How does it work?

Goesrecv sends statsd statistics to the StatsD Duplicator service on port 8325. StatsD Duplicator then sends the statistics both to graphite/statsd (and therefore, Vitality GOES) on port 8225, as well as Grafana on port 8125.

## Other Tidbits

#### I already set up graphite with the instructions in the main readme and now everything's broken. How do I fix it?
As root, run `docker stop graphite && docker rm graphite`. Then `docker run...` command above to make it use the custom port.

#### I'm an advanced user, and I have graphite and Grafana running on different machines. How do I make this work for me?
After creating the file at /usr/lib/systemd/system/statsdsplitter.service on your ground station, edit it (ex. `sudo nano /usr/lib/systemd/system/statsdsplitter.service`). Edit the IPs and ports after each `udp4-datagram` to match your Grafana and graphite/statsd instances.

Afterwards, run `systemctl daemon-reload && systemctl restart statsdsplitter`
