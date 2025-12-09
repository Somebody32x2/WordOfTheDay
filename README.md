# Word of the Day App

A svelte webapp that displays my word/concept of the day and allows a simple access panel to set the current topic of the day.
I don't know how long I will remember to update this so **_expect this to be abandoned quickly_**.

TODO:
 - [ ] Main Page
   - [ ] Prior words/calendar UI
   - [ ] Show def/notes styled/optionalized
   - [ ] Notifications subscribe button (but not in your face)
 - [ ] Admin Page
   - [ ] Rudimentary Auth (.env key that allows api access to do _anything_)
   - [ ] Editing UI w/ Miriam Webster API integration & syntax
   - [ ] PWA?

## Developing

Once you've installed dependencies with `bun install`, start a development server:

```sh
bun dev

# or start the server and open the app in a new browser tab
bun dev --open
```

## Building

To create a production version of your app:

```sh
bun build
```

You can preview the production build with `bun preview`.
