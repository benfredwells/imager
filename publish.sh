#!/bin/sh

if [ $# -ne 1 ]; then
  echo "Usage - $0 dir"
  exit 1
fi

cp *.html "$1"
cp *.js "$1"
cp *.css "$1"
