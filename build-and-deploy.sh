#!/bin/bash

while getopts ":b:" opt; do
  case ${opt} in
    b ) 
        branch=$OPTARG
        ;;
    \?) echo "Invalid option -$OPTARG" >&2
    ;;
  esac
done

if [ -z "${branch}" ]; then
    read -p "What branch do you want to deploy? " branch
fi


pm2 stop www
git checkout $branch
rm -rf /server/build
npm run build
cd /server
migrate-mongo up
pm2 start ./bin/www
echo "OFI has been released :party_blob:"
