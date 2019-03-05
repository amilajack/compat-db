compat-db
=========

> ## 🛠 Status: In Development
> compat-db is currently in development. It's on the fast track to a 1.0 release, so we encourage you to use it and give us your feedback, but there are things that haven't been finalized yet and you can expect some changes.

[![Build Status](https://travis-ci.org/amilajack/compat-db.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/compat-db)
[![NPM version](https://badge.fury.io/js/compat-db.svg?maxAge=2592)](http://badge.fury.io/js/compat-db)
[![npm](https://img.shields.io/npm/dm/compat-db.svg?maxAge=2592)](https://npm-stat.com/charts.html?package=compat-db)

A browser API compatibility database

## Goals
* Automate browser compatibility testing of APIs
* Be a drop-in replacement for [caniuse-db](https://github.com/Fyrd/caniuse)
* Provide a node API for finding compatibility records

## Installation
```bash
npm install compat-db
```

## Development Setup
```bash
git clone https://github.com/amilajack/compat-db.git
cd compat-db
yarn

# Create your `.env` file
# ⚠️  Make sure to add your saucelabs keys to your `.env` file ⚠️
cp .env.example .env

# Migrate the sqlite (the default) or mysql database
yarn migrate

# Build the compatibility database to ./lib/all.json
# 💡 You can limit the amount of tests that you run by setting the following ENV's
# PROVIDERS_INDEX_START=0 PROVIDERS_INDEX_END=10 in your `.env` to run the first
# 10 tests
yarn build-compat-db

# Run all tests
yarn test

# If you want to run tests on your local chrome canary installation, install
# and start selenium server. Note that you will need Java to run this 😢
yarn global add selenium-standalone@latest
selenium-standalone install
selenium-standalone start

# Serve the front-end browser UI for compat-db
yarn view-compat-db
```

## Roadmap
See [the roadmap wiki](https://github.com/amilajack/compat-db/wiki/Roadmap)
