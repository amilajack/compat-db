compat-db
=========

A work-in-progress attempt to make a central and scalable browser api compatability database

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
npm run spec
```

## Roadmap
See [the roadmap wiki](https://github.com/amilajack/compat-db/wiki/Roadmap)
