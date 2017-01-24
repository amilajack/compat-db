compat-db
=========
[![Build Status](https://travis-ci.org/amilajack/compat-db.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/compat-db)
[![Build status](https://ci.appveyor.com/api/projects/status/at71r1stbghsgcja/branch/master?svg=true&maxAge=2592)](https://ci.appveyor.com/project/amilajack/compat-db/branch/master)
[![NPM version](https://badge.fury.io/js/compat-db.svg?maxAge=2592)](http://badge.fury.io/js/compat-db)
[![Dependency Status](https://img.shields.io/david/amilajack/compat-db.svg?maxAge=2592)](https://david-dm.org/amilajack/compat-db)
[![npm](https://img.shields.io/npm/dm/compat-db.svg?maxAge=2592)](https://npm-stat.com/charts.html?package=compat-db)

A work-in-progress attempt to make a central and scalable browser api compatibility database

## Goals
- [ ] Provide a compiled list of compatibility records
- [ ] Provide an API for traversing/filtering the records and finding supported features

## Installation
```bash
# Clone and install
git clone https://github.com/amilajack/compat-db.git
cd compat-db
yarn # or npm install

# Install and start selenium server
npm install selenium-standalone@latest -g
selenium-standalone install
selenium-standalone start

# In a new tab, run the tests
npm run compat-test
```

## Roadmap
See [the roadmap wiki](https://github.com/amilajack/compat-db/wiki/Roadmap)
