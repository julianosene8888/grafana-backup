# !/bin/bash

echo 'Updating MySQL container...'

apt update
apt-get install cron -y
apt-get install nano -y
apt update

echo "0 0 * * */3 /var/lib/script/warehouseBackup.sh>/var/lib/mysqlBackup/cronBackup.log" >> /var/spool/cron/crontabs/root
