# Graphite/statsd
Goesrecv supports logging information about error correction rate, packet drop rates, and so on to a statsd server. This information is invaluable to ground station operators, so it should be made easily accessible. This project accomplishes this by staging the information in a Graphite database, which Vitality GOES can then query and present to the user.

Configuring Graphite is not necessary to use Vitality GOES, but no graphs will be available if you don't set it up. If Vitality GOES is on a different machine from goestools, graphite/statsd can be installed on either machine.

**If you're currently using Grafana, you'll need to follow extra steps to keep using it.** [See here for more details](docs/grafana-compatibility.md). Alternatively, you can choose to stop using Grafana, or disable graphs within Vitality GOES.

In a normal setup, here's how to configure graphits/statsd:

1. If you're not using it already, install Docker on the target machine. This varies by distro, but you can find instructions for Ubuntu and its variants [here](https://docs.docker.com/engine/install/ubuntu/) and Raspberry Pi OS [here](https://dev.to/elalemanyo/how-to-install-docker-and-docker-compose-on-raspberry-pi-1mo). Docker Compose is not required.
2. As root, run the following commands to create a storage area for graphite.
    ```
    mkdir -p /var/lib/graphite/config
    mkdir -p /var/lib/graphite/data
    mkdir -p /var/lib/graphite/statsd_config
    mkdir -p /var/lib/graphite/log
    ```
3. Download graphite/statsd by running `docker pull graphiteapp/graphite-statsd`
4. Run the following command to configure graphite/statsd, start it up, and set it to start at system boot:
    ```
    docker run -d\
     --name graphite\
     --restart=always\
     --privileged\
     -p 8080:80\
     -p 8125:8125/udp\
     -p 8126:8126\
     -v /var/lib/graphite/config:/opt/graphite/conf\
     -v /var/lib/graphite/data:/opt/graphite/storage\
     -v /var/lib/graphite/statsd_config:/opt/statsd/config\
     -v /var/lib/graphite/log:/var/log\
     graphiteapp/graphite-statsd
     ```
That's it! To verify it's working, go to http://graphiteip:8080/ (example: http://192.168.1.123:8080/) and make sure you see something that looks like the screenshot below.

**If you get an Error 502**, wait 2 minutes and check again - graphite can take a minute to start on slower machines like a Raspberry Pi.

![Example of what Graphite should look like when installed](https://user-images.githubusercontent.com/24253715/210030879-645f14ab-c2fd-4030-9823-ce26d3f78c05.png)

## Running Graphite and Grafana at the same time
Within the community, it's popular to run Grafana to track statsd statistcs from goesrecv. The problem is, Goesrecv only supports sending statsd statistics to one statsd host at a time, and Vitality GOES uses graphite/statsd as its statsd handler. This begs the question: if you want to have statistics in both Vitality GOES and Grafana, how do you do that?

The solution is to use an alternative configuration for graphite/statsd, along with a helper service. No changes are needed to your Grafana setup. For simplicity, these instructions assume you have goesrecv, Grafana, and graphite/statsd all running on the same machine. Here are the steps:

1. Make sure `socat` is installed on your system. If it's not, run `sudo apt install socat`.
2. Modify the `[monitor]` section of your goesrecv.conf file to look like this (don't forget to restart goesrecv afterwards):

   ```
   [monitor]
   statsd_address = "udp4://127.0.0.1:8325"
   ```
3. Copy [extra/statsdduplicator.service](/extra/statsdduplicator.service) from this repo to /lib/systemd/system/statsdduplicator.service on your ground station machine
4. Run the following commands **as root**:
    ```
    systemctl daemon-reload
    systemctl enable statsdduplicator
    systemctl start statsdduplicator
    ```
6. Follow the normal steps in the readme under [Preparing your system for Vitality GOES > Graphite/statsd](/README.md#graphitestatsd). The only difference is that you will want to use this command instead for step 4:
   ```
   docker run -d\
    --name graphite\
    --restart=always\
    --privileged\
    -p 8080:80\
    -p 8225:8125/udp\
    -p 8126:8126\
    -v /var/lib/graphite/config:/opt/graphite/conf\
    -v /var/lib/graphite/data:/opt/graphite/storage\
    -v /var/lib/graphite/statsd_config:/opt/statsd/config\
    -v /var/lib/graphite/log:/var/log\
    graphiteapp/graphite-statsd
   ```

### How does statsdduplicator work?

Goesrecv sends statsd statistics to the StatsD Duplicator service on port 8325. StatsD Duplicator then sends the statistics both to Grafana on port 8125, as well as graphite/statsd (and therefore, Vitality GOES) on port 8225.

### Other Tidbits

#### I already set up graphite without graphite, but now I need it. How do I fix it?
As root, run `docker stop graphite && docker rm graphite`. Then `docker run...` command above to make it use the custom port.

#### I'm an advanced user, and I have graphite and Grafana running on different machines. How do I make this work for me?
After creating the file at /lib/systemd/system/statsdduplicator.service on your ground station, edit it (ex. `sudo nano /lib/systemd/system/statsdduplicator.service`). Edit the IPs and ports after each `udp4-datagram` to match your Grafana and graphite/statsd instances.

Afterwards, run `systemctl daemon-reload && systemctl restart statsdduplicator`
