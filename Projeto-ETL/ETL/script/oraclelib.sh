#!/bin/bash

# Update System
# Installation: execute command -> source ./script/oraclelib.sh
# Install pre-requisites to set up oracle ETL

echo 'Updating debian apt-get...'

apt-get update -y

apt-get upgrade -y

echo 'Creating oracle lib...'

mkdir -p /opt/oracle

cd /opt/oracle

wget https://download.oracle.com/otn_software/linux/instantclient/218000/instantclient-basic-linux.x64-21.8.0.0.0dbru.zip

unzip instantclient-basic-linux.x64-21.8.0.0.0dbru.zip

apt-get install -y libaio1

echo 'Exporting ORACLE to PATH...'

sh -c "echo /opt/oracle/instantclient_21_8 > /etc/ld.so.conf.d/oracle-instantclient.conf"

ldconfig

export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_8:$LD_LIBRARY_PATH
export TNS_ADMIN=/opt/oracle/instantclient_21_8/network/admin:$TNS_ADMIN
export PATH=/opt/oracle/instantclient_21_8:$PATH

echo 'Exporting TNS to PATH...'

cd /opt/oracle/instantclient_21_8/network/admin

touch tnsnames.ora

echo 'O84PRDG.WORLD=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=172.26.16.32)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=o84prdg)(UR=A)))' > tnsnames.ora

