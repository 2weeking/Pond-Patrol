# Pond Patrol 🦆

A simple tower defense game: place ducks, pop balloons, buy upgrades, and survive 15 waves.

## Play the game

**[▶ Play Pond Patrol in your browser](https://2weeking.github.io/AI-Project/)**

Click the link, then click **Let's quack**. You don't need to install anything.

> The play link works after the repository owner enables GitHub Pages using the steps below. Until then, you can play on your computer.

## How to play

1. Choose a duck from the panel on the right.
2. Click the grass to place it near the balloon path.
3. Click **Start wave**.
4. Click a placed duck to buy upgrades with the coins you earn.
5. Survive all **15 waves** without losing all **100 lives**.

There are three duck types: **Scout**, **Super**, and **Mage**. Stronger balloons arrive as you progress, and giant bosses appear in the last three waves. The **?** button in the game explains special balloons and upgrades.

Press **Space** to start or pause a wave. Use the **1× / 3×** button to change speed. Your progress saves automatically between waves in the same browser.

## Put the game online with GitHub Pages

**For the repository owner — do this once after pushing the files to GitHub:**

To push from VS Code, open **Source Control**, stage your changes with **+**, enter a commit message, click **Commit**, then **Sync Changes** (or **Push**).

1. Open your [AI-Project repository](https://github.com/2weeking/AI-Project).
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Choose the **main** branch and the **/ (root)** folder.
5. Click **Save**.
6. Wait for GitHub to finish publishing. This can take up to 10 minutes.

Your game will be at **https://2weeking.github.io/AI-Project/**. Visitors can click the play link at the top of this README. Future updates publish when you push changes to `main`.

The included `.nojekyll` file tells GitHub to serve the game files directly. No build command is needed. If the repository uses GitHub Free, it must be public to use Pages.

[GitHub's setup guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [GitHub's publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## Play on your computer

Use this if you want to edit the game or the online version isn't available yet.

1. Download this repository using **Code → Download ZIP**, then unzip it. Or use your existing copy.
2. Open the game folder in **VS Code**.
3. Open **Terminal → New Terminal**.
4. If you have Python installed, run:

   ```sh
   python play.py
   ```

   On Windows, `py play.py` also works when Python is installed through the Python launcher.

5. Open **http://localhost:8000** in your browser. Leave the terminal running while you play.

If you have Node.js instead of Python, use `node server.js` in step 4. Only run one launcher at a time. Stop it with **Ctrl+C** when you're done.

Don't open `index.html` by double-clicking it. Use the play link or one of the launchers above.

## Editing the game

- `src/engine.js` — waves, balloon strength, duck upgrades, coins, and lives.
- `src/render.js` — map decorations, duck appearances, and animation.
- `src/main.js` — controls, menus, sound, and saving.
- `index.html` and `styles.css` — page layout and appearance.
- `play.py` and `server.js` — local launchers; GitHub Pages doesn't need them.

To run the game-rule tests with Node.js:

```sh
node --test tests/engine.test.js
```
