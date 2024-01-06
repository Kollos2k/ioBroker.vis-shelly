#!/bin/bash

cp ./widgets/vis-shelly.html ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly.html
cp ./widgets/vis-shelly/css/style.css ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly/css/style.css
cp ./widgets/vis-shelly/js/vis-shelly.js ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly/js/vis-shelly.js
cp ./widgets/vis-shelly/js/vis-shelly.editMode.js ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly/js/vis-shelly.editMode.js


cp -r ./admin/* ./.dev-server/default/node_modules/iobroker.vis-shelly/admin
cp -r ./lib/* ./.dev-server/default/node_modules/iobroker.vis-shelly/lib
cp -r ./widgets/* ./.dev-server/default/node_modules/iobroker.vis-shelly/widgets
cp ./io-package.json ./.dev-server/default/node_modules/iobroker.vis-shelly
cp ./LICENSE ./.dev-server/default/node_modules/iobroker.vis-shelly
cp ./main.js ./.dev-server/default/node_modules/iobroker.vis-shelly
cp ./package.json ./.dev-server/default/node_modules/iobroker.vis-shelly
cp ./README.md ./.dev-server/default/node_modules/iobroker.vis-shelly


./.dev-server/default/iobroker upload vis-shelly
./.dev-server/default/iob restart vis
./.dev-server/default/iob restart vis-shelly