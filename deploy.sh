#!/bin/bash

echo "------------------------------"
echo "Uploading client"
for entry in src/client/build/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.json" ]; then
    echo "Uploading $entry"
    curl --ftp-create-dirs -T $entry -u $FTP_USER:$FTP_PASS ftp://geeksong.com/public_html/ghostshell/$entry
  fi
done

echo "------------------------------"
echo "Uploading server"
for entry in src/server/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.php" ] && [ "$entry" != "vendor" ] && [ "$entry" != "composer.json" ] && [ "$entry" != "composer.lock" ]; then
    echo "Uploading $entry"
    curl --ftp-create-dirs -T $entry -u $FTP_USER:$FTP_PASS ftp://geeksong.com/public_html/ghostshell/srv/$entry
  fi
done
