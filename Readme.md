# Project Mgt API

A brief description of what this project does and who it's for.

## Documentation

Find API endpoints and Documentation in the link below

[Documentation](https://documenter.getpostman.com/view/9742220/2s93XsXkcj)

## Environment Variables

To run this project locally, you will need to copy the environment variables from the .example.env file to your .env file and replace the following variables

`DATABASE_LOCAL`

`PORT`

## Installation

```bash
  npm install
  npm run dev
```

## API Filters

filter task by the following query params

`http://localhost:3000/api/v1/tasks?status=done`

status can be done, available or todo. defaults to available when a new task is created.

`http://localhost:3000/api/v1/tasks?startDate=2023-04-08`

`http://localhost:3000/api/v1/tasks?dueDate=2022-04-08`

`http://localhost:3000/api/v1/tasks?name=make`
name includes text search of task name, it's also case insensitive.

More of these documented on the API Docs [API Docs](https://documenter.getpostman.com/view/9742220/2s93XsXkcj)
