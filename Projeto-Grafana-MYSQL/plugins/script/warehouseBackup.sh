#!/bin/bash

warehouseBackup() {

    echo "Starting backup process"

    cd /

    echo "current dir: $(pwd)" 

    cd /var/lib/mysqlBackup/

    echo "current dir: $(pwd)" 

    rm warehouseBackup_*.sql

    echo "Old warhouseBackup deleted!"

    mysqldump --databases warehouseGPP > /var/lib/mysqlBackup/warehouseBackup_$(date +"%d-%m-%Y-%H:%M").sql -uroot -pnaturaGPP

    echo "New warehouseBackup created at $(date +"%d-%m-%Y-%H:%M")"

}

warehouseBackup
