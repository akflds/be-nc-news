# Northcoders News API

An API that mimics a social news service (e.g. Reddit). This project is built with Node.js with data stored in PostgreSQL.

## Installation

1. Start by cloning and cd'ing into the repository
2. Run `npm i` to install the project dependencies
3. Run the following to set up environment variables for the test and dev database:
   ```
   echo 'PGDATABASE=nc_news' > ./.env.development
   echo 'PGDATABASE=nc_news_test' > ./env.test
   ```
4. Use `npm run setup-dbs` to setup the databases
