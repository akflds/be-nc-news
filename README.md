# NC News API

This API mimics that found on a social news aggregator (think Reddit). It provides functionality to access and manipulate articles, comments, topics and users.

This project is built with Node.js and Express. Data is stored in PostgreSQL. The API is hosted on Heroku and can be accessed at: [https://akflds-news-api.herokuapp.com/api](https://akflds-news-api.herokuapp.com/api)

A full list of endpoints are provided below, along with instructions to set up and run your own version of this app.

## Installation

Follow these instructions to install and deploy your own version of this app.

### Requirements

This project requires: Node.js (v17.x) and PostgreSQL (v13.6 or above).

### Instructions

To setup and test this project:

1. Clone the respository and `cd` into the directory
2. Run `npm install` to install the project and any dependencies
3. From the root of the project directory, run the following to set up environment variables for the test and dev database: :

   ```
   echo 'PGDATABASE=nc_news' > ./.env.development
   echo 'PGDATABASE=nc_news_test' > ./.env.test
   ```

4. Run `npm run setup-dbs` to setup the development and test databases
5. Now you're ready to run or test the API:
   - To run the app, use: `npm start`. The default port is 8000.
   - To test the app, use: `npm test`

## Usage

This API provides the following endpoints.

| Method | Endpoint                           | Description                                                               |
| ------ | ---------------------------------- | ------------------------------------------------------------------------- |
| GET    | /api                               | serves up a json representation of all the available endpoints of the api |
| GET    | /api/topics                        | serves an array of all topics                                             |
| GET    | /api/articles                      | serves an array of all articles                                           |
| GET    | /api/articles/:article_id          | serves an individual article, specified by the article_id                 |
| PATCH  | /api/articles/:article_id          | updates the vote count for a specific article                             |
| GET    | /api/articles/:article_id/comments | serves an array of comments for the specified article                     |
| POST   | /api/articles/:article_id/comments | adds a new comment for the specified article                              |
| DELETE | /api/comments/:comment_id          | removes the comment with the specified id                                 |
| GET    | /api/users                         | serves an array of all users                                              |
| GET    | /api/users/:username               | serves an individual user, specified by the username users                |
| PATCH  | /api/comments/:comment_id          | updates the vote count for a specific comment                             |
| POST   | /api/articles                      | adds a new article                                                        |

## Acknowledgements

Thanks to [Northcoders](https://northcoders.com) for providing the data for this project and to Emily, August, Kyle, Sarah and Kev for the code reviews!
