# Board | A simple app that lets you organize your ideas in a unique way.

## Homepage (link in description)
![welcome-image](https://raw.githubusercontent.com/alexZajac/Board/master/public/demosImages/welcome.PNG)

## Core functionalities
- Create boards that serve as a storage for your notes. You can create unlimited boards, and customize their names, users allowed, privacy type as well as the number or notes on them. 
> ![boards-image](https://raw.githubusercontent.com/alexZajac/Board/master/public/demosImages/boards.PNG)
- The notes you create can contain any text, embedable content (gifs, articles, links) and images from your computer. A custom editor is provided by [medium-draft](https://github.com/brijeshb42/medium-draft) to let you format the text in anyway you want.
> ![board-image](https://raw.githubusercontent.com/alexZajac/Board/master/public/demosImages/board.PNG)
- You can share your boards with other users of the app and choose between Incognito mode (only you can edit your notes) and public mode (full edit control on your notes).
## Stack
- The Firebase service is used for the backend, and is providing both the realtime database, and the authentification service via OAuth. It supports accounts created with an email, Facebook or Google token. The realtime database allows to edit notes at the same time and on the same board. 
- The front-end is entirely made with ReactJS, and provides a component architecture compatible with the core idea of the application.

