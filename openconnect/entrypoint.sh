sysctl net.ipv4.conf.all.forwarding=1
iptables -t nat -A POSTROUTING -o tun-natura -j MASQUERADE

echo $VPN_PASSWORD | openconnect --user=$VPN_USER --passwd-on-stdin --interface=$VPN_TUN --authgroup=$VPN_AUTHGROUP --servercert pin-sha256:$VPN_SERVER_CERT --reconnect-timeout=30 --dump-http-traffic --timestamp $VPN_SERVER_ADDR &

APP_PID=$!

function shutdown {
    echo "Trapped SIGTERM/SIGINT/x so shutting down App..."
    kill -s SIGTERM ${APP_PID}
    wait ${APP_PID}
    echo "Shutdown complete"
}

trap shutdown SIGTERM SIGINT
wait ${APP_PID}

