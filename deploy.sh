#!/bin/bash

echo "------------------------------"
echo "Uploading client"
for entry in src/client/build/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.json" ]; then
    echo "Uploading $entry"
    curl -T $entry -u ftp://geeksong.com/public_html/ghostshell/ $FTP_USER:$FTP_PASS 
  fi
done
for entry in src/client/build/static*
do
  if [ -f "$entry" ]; then
    echo "Uploading $entry"
    curl -T $entry ftp://geeksong.com/public_html/ghostshell/static/ -u $FTP_USER:$FTP_PASS 
  fi
done

echo "------------------------------"
echo "Uploading server"
for entry in src/server/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.php" ] && [ "$entry" != "vendor" ] && [ "$entry" != "composer.json" ] && [ "$entry" != "composer.lock" ]; then
    echo "Uploading $entry"
    curl -T $entry ftp://geeksong.com/public_html/ghostshell/srv/ -u $FTP_USER:$FTP_PASS 
  fi
done
