#!/bin/bash
# Install root dependencies
npm install

# Install client dependencies and build
cd client
npm install
CI=false npm run build

