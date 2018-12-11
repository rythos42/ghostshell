#!/bin/bash

echo "------------------------------"
echo "Uploading client"
for entry in src/client/build/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.json" ]; then
    echo "Uploading $entry"
    curl -v -T $entry -u $FTP_USERNAME:$FTP_PASSWORD --disable-epsv ftp://geeksong.com/public_html/ghostshell/
  fi
done
for entry in src/client/build/static/css/*
do
  if [ -f "$entry" ]; then
    echo "Uploading $entry"
    curl -v -T $entry -u $FTP_USERNAME:$FTP_PASSWORD --disable-epsv ftp://geeksong.com/public_html/ghostshell/static/css/
  fi
done
done
for entry in src/client/build/static/js/*
do
  if [ -f "$entry" ]; then
    echo "Uploading $entry"
    curl -v -T $entry -u $FTP_USERNAME:$FTP_PASSWORD --disable-epsv ftp://geeksong.com/public_html/ghostshell/static/js/
  fi
done

echo "------------------------------"
echo "Uploading server"
for entry in src/server/*
do
  if [ -f "$entry" ] && [ "$entry" != "config.php" ] && [ "$entry" != "vendor" ] && [ "$entry" != "composer.json" ] && [ "$entry" != "composer.lock" ]; then
    echo "Uploading $entry"
    curl -v -T $entry -u $FTP_USERNAME:$FTP_PASSWORD --disable-epsv ftp://geeksong.com/public_html/ghostshell/srv/
  fi
done
