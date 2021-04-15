# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot of the urls home page"](https://github.com/roshan0926/tinyapp/blob/master/docs/urls-page.png)
!["screenshot of the urls home page while logged in and have inputted links"](https://github.com/roshan0926/tinyapp/blob/master/docs/urls-logged-in-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Use On localhost:8080 in your browser

## How its Used 

- First Register using the register button.
- Users must first be logged in to create new links as well as viewing them and editing them.
- you can only view links that are asociated with the specific account.

- Create New Links via the create new link tab on the header bar.

- Then simply enter the URL you want to shrink.

- Edit or Delete Short Links on the /urls directory via the buttons provided.
- Editing links will update where the url will take you.

- Use Your Short Link on the main page or in the editing page.