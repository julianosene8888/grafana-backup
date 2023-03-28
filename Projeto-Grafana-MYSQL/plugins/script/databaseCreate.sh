# !/bin/bash

echo 'Creating initial database...'

mysql -uroot -pnaturaGPP -e "create database warehouseGPP character set utf8mb4 collate utf8mb4_bin;"
mysql -uroot -pnaturaGPP -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'naturaGPP' WITH GRANT OPTION;"
mysql -uroot -pnaturaGPP -e "flush privileges;"
mysql -uroot -pnaturaGPP -e "GRANT ALL PRIVILEGES ON *.* TO 'naturaGPP'@'%' IDENTIFIED BY 'naturaGPP' WITH GRANT OPTION;"
mysql -uroot -pnaturaGPP -e "flush privileges;"
