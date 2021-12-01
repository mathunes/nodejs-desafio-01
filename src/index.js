const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.get("username");
  
  const user = users.find(
    user => user.username === username
  );

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (users) => users.username === username
  )

  if (userAlreadyExists) {
    return response.status(400).json({error: "User already exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  
  users.push(user);

  return response.status(201).send({name, username})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const username = request.get("username");

  const user = users.find(
    user => user.username === username
  );

  const todos = user.todos;

  return response.status(201).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(user.todos);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  var position = (user.todos.findIndex((i) => {
    return (i.id === request.params.id)
  }));

  if (position === -1) {
    return response.status(404).json({error: "Task not found"});
  }
  
  const { title, deadline } = request.body;

  user.todos[position].title = title;
  user.todos[position].deadline = deadline;

  return response.status(201).json(user.todos[position]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  var position = (user.todos.findIndex((i) => {
    return (i.id === request.params.id)
  }));

  if (position === -1) {
    return response.status(404).json({error: "Task not found"});
  }
  
  user.todos[position].done = true;

  return response.status(201).json(user.todos[position]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  var position = (user.todos.findIndex((i) => {
    return (i.id === request.params.id)
  }));

  if (position === -1) {
    return response.status(404).json({error: "Task not found"});
  }
  
  user.todos.splice(position, 1);

  return response.status(201).json(user.todos);
});

module.exports = app;