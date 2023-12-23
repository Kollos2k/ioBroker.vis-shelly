#!/bin/bash

cp ./widgets/vis-shelly.html ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly.html
cp ./widgets/vis-shelly/css/style.css ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly/css/style.css
cp ./widgets/vis-shelly/js/vis-shelly.js ./.dev-server/default/iobroker-data/files/vis/widgets/vis-shelly/js/vis-shelly.js

./.dev-server/default/iob restart vis