#!/bin/bash
mkdir deb_mc
cd deb_mc
sudo apt update
sudo apt upgrade -y
sudo apt install curl wget openjdk-21-jdk sed -y
chmod +x deb_mc_install_2.sh
sudo bash -c "$(curl -sSL https://resource.fit2cloud.com/1panel/package/v2/quick_start.sh)"