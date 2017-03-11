compat-db
=========
[![Build Status](https://travis-ci.org/amilajack/compat-db.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/compat-db)
[![NPM version](https://badge.fury.io/js/compat-db.svg?maxAge=2592)](http://badge.fury.io/js/compat-db)
[![Dependency Status](https://img.shields.io/david/amilajack/compat-db.svg?maxAge=2592)](https://david-dm.org/amilajack/compat-db)
[![npm](https://img.shields.io/npm/dm/compat-db.svg?maxAge=2592)](https://npm-stat.com/charts.html?package=compat-db)

A central and scalable browser API compatibility database

**❌ WORK IN PROGRESS. DO NOT USE ❌**

## Goals
- [ ] Be a (almost) drop-in replacement for caniuse-db
- [ ] Provide a compiled list of compatibility records
- [ ] Provide an API for traversing/filtering the records and finding supported features
- [ ] Collect all CSS properties and their corresponding values

## Installation
```bash
npm install --save compat-db
```

## Development Setup
```bash
# Clone and install
git clone https://github.com/amilajack/compat-db.git
cd compat-db
yarn # or npm install

# Create your `.env` file
# ⚠️  Make sure to add your saucelabs keys to your `.env` file ⚠️
cp .env.example .env

# Migrate the sqlite (default) or mysql database
npm run migrate

# Build the compatibility database to ./lib/all.json
# 💡 You can limit the amount of tests that you run by setting the following ENV's
# PROVIDERS_INDEX_START=0 PROVIDERS_INDEX_END=10 in your `.env` to run the first
# 10 tests
npm run build-compat-db

# Run specs
npm run spec

# Run all tests
npm test

# If you want to run tests on your local chrome canary installation, install
# and start selenium server
npm install -g selenium-standalone@latest
selenium-standalone install
selenium-standalone start

# Serve the front-end browser UI for compat-db
npm run view-compat-db
```

## Roadmap
See [the roadmap wiki](https://github.com/amilajack/compat-db/wiki/Roadmap)
