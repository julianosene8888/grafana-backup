#!/bin/bash

grafanaBackup() {

    echo "Starting backup process"

    cd /sysmap/docker/gpp/grafanaBackup

    echo "current dir: $(pwd)" 

    cd /sysmap/docker/gpp/grafanaBackup/

    echo "current dir: $(pwd)" 

    rm  -r /sysmap/docker/gpp/grafanaBackup/Projeto-Grafana-MYSQL/grafana/

    echo "Old grafana deleted!"

    docker cp grafana-gpp:/var/lib/grafana /sysmap/docker/gpp/grafanaBackup/Projeto-Grafana-MYSQL/

    echo "New grafana created successfully!"
    
    chmod 755 /sysmap/docker/gpp/grafanaBackup/Projeto-Grafana-MYSQL/grafana/

    cd /sysmap/docker/gpp/grafanaBackup/Projeto-Grafana-MYSQL/plugins/mysqlBackup

    rm warehouseBackup_*.sql

    cp /sysmap/docker/gpp/Projeto-Grafana-MYSQL/plugins/mysqlBackup/warehouseBackup_*.sql /sysmap/docker/gpp/grafanaBackup/Projeto-Grafana-MYSQL/plugins/mysqlBackup/

    cd /sysmap/docker/gpp/grafanaBackup

    git add .

    git commit -m "grafanaBackup-$(date +"%d-%m-%Y")"

    git push -u origin main

    echo "New grafanaBackup updated at $(date +"%d-%m-%Y-%H:%M")"
}

grafanaBackup
