#!/bin/bash

echo "------------------------------"
echo "Uploading client"
for entry in src/client/build/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.json" ]; then
    echo "Uploading $entry"
    curl -T $entry -u $FTP_USERNAME:$FTP_PASSWORD ftp://geeksong.com/public_html/ghostshell/
  fi
done
for entry in src/client/build/static/*
do
  if [ -f "$entry" ]; then
    echo "Uploading $entry"
    curl -T $entry -u $FTP_USERNAME:$FTP_PASSWORD ftp://geeksong.com/public_html/ghostshell/static/
  fi
done

echo "------------------------------"
echo "Uploading server"
for entry in src/server/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.php" ] && [ "$entry" != "vendor" ] && [ "$entry" != "composer.json" ] && [ "$entry" != "composer.lock" ]; then
    echo "Uploading $entry"
    curl -T $entry -u $FTP_USERNAME:$FTP_PASSWORD ftp://geeksong.com/public_html/ghostshell/srv/
  fi
done
