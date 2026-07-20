# Movie Management System

A Movie Management System built using **Node.js**, **Express.js**, **EJS**, **MongoDB**, **Mongoose**, and **Multer**. This project allows users to add, update, delete, and view movie details along with movie posters.

## Features

- Add new movies
- Upload movie posters
- View all movies
- Edit movie details
- Delete movies
- Responsive user interface

## Technologies Used

- Node.js
- Express.js
- EJS
- MongoDB
- Mongoose
- Multer
- CSS

## Project Structure

```
movie-project/
│
├── models/
│   └── movie.js
├── routes/
│   └── movieRoutes.js
├── views/
│   ├── index.ejs
│   ├── add.ejs
│   └── edit.ejs
├── public/
│   ├── uploads/
│   └── css/
│       └── style.css
├── app.js
└── package.json
```

## Installation

1. Clone the project.

2. Install dependencies.

```bash
npm install
```

3. Start MongoDB.

4. Run the project.

```bash
npm start
```

For development:

```bash
npm run dev
```

5. Open your browser and visit:

```
http://localhost:3000
```

## Database Schema

```js
const movieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  releaseYear: Number,
  poster: String
});
```

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Display all movies |
| GET | /add | Add movie page |
| POST | /add | Save new movie |
| GET | /edit/:id | Edit movie page |
| PUT | /edit/:id | Update movie |
| DELETE | /delete/:id | Delete movie |

## Output

- Add movies with poster images
- Update movie information
- Delete movies
- Store movie data in MongoDB
- Display all movies in a clean card layout

## Author

**Malak Maisuriya**