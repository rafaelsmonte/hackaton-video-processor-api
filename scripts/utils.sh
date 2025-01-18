#!/bin/bash

#==============================================================================
# File: utils.sh
# Author: Thiago Thalison Firmino de Lima (Intelbras)
# Date: 26 jul 2024
# Brief: Utilities to use on development
#==============================================================================

#==============================================================================
# Settings
#==============================================================================


#==============================================================================
# Commands
#==============================================================================
case "$1" in

  install-k6)
    sudo gpg -k
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6
  ;;

  *)
    echo "Usage: ./eks-cluster-mng.sh [install-k6]"
  ;;

esac
