#!/bin/bash
#build app
pushd public
echo "browserify  -d js/main.js -o js/build.js"
browserify  -d js/main.js -o js/build.js &
pid1=$!
echo "browserify js/main.js | uglifyjs > js/build.min.js"
export NODE_ENV=production
browserify js/main.js | uglifyjs > js/build.min.js &
pid2=$!
unset NODE_ENV

#build vr

pushd vr
echo "browserify  -d js/main.js -o js/build.js"
browserify  -d js/main.js -o js/build.js &
pid5=$!
echo "browserify js/main.js | uglifyjs > js/build.min.js"
export NODE_ENV=production
browserify js/main.js | uglifyjs > js/build.min.js &
pid6=$!
unset NODE_ENV
popd #vr


popd #public

wait $pid1
wait $pid2
wait $pid5
wait $pid6


#build iot
pushd iot
cafjs pack true . ./app.tgz &&  mv ./app.tgz ../public/iot.tgz

# browserify iot
cafjs mkStatic
echo "browserify --ignore ws -d . -o ../public/js/build-iot.js"
browserify --ignore ws -d . -o ../public/js/build-iot.js &
pid1=$!
echo "browserify --ignore ws . | uglifyjs > ../public/js/build-iot.min.js"
export NODE_ENV=production
browserify  --ignore ws . | uglifyjs > ../public/js/build-iot.min.js &
pid2=$!
unset NODE_ENV

wait $pid1
wait $pid2

# rm staticArtifacts.js
rm -fr node_modules/*;
popd #iot
