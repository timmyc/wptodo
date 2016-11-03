# wptodo

This is a simple example application using the new WP REST API on WordPress.com that allows you to track your todo list.  To use the application locally, you will need node installed, a WordPress.com site ( preferrably marked private ) and an oauth token with permissions to said site.

## Installation

Install node on your computer and clone this repo.

Have a WordPress.com site handy, or ideally make a new one specifically for your todo's.

Generate an authentication token following the
[auth documentation](https://developer.wordpress.com/docs/oauth2/).

Open `index.js` in your local copy of this repo and edit lines 5 and 6 with your authkey and WordPress.com domain

```
const authKey = 'Bearer <GENEREATED TOKEN HERE>';
const WordPressComUrl = '<YOUR SITE>.wordpress.com';
```

Install the node module globally via `npm install -g` - you may need to `npm link` as well to ensure the `wptodo` command is available everywhere.

## Usage

Type `wptodo` from the command prompt to display the options.  But you can `wptodo add` to add a new item.  `wptodo list` to list all open items, and `wptodo done` folled by the todo number ( post ID ) to mark an item as done.

## License

GPL v3.  See the `LICENSE` file.
