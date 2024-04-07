# HOT Maps: mapping game feature for iD JavaScript editor [OpenStreetMap](https://www.openstreetmap.org/)

[![build](https://github.com/openstreetmap/iD/workflows/build/badge.svg)](https://github.com/openstreetmap/iD/actions?query=workflow%3A%22build%22)

## New Features for HOT Maps

<div align="center">
  <h2> Video Demo </h2>
  <a href="https://youtu.be/ENacIeLF61U">
    <img src="https://img.youtube.com/vi/ENacIeLF61U/0.jpg" alt="HOT Maps Demo" width=800>
  </a>
</div>

We've added a mandatory testing stage in the tutorial that all users must attempt before freely editing and modifying the existing map.
* The stage consists of multiple mapping tasks such as house outlining and road tracing.
  * This stage can be found under modules/ui/intro/testYourself.js 
* Using our custom metrics, we evaluate the accuracy of the user's shapes and lines against the ground-truth existing maps.
   * Accessible via the similarityScore and roadScore functions in modules/ui/intro/helper.js
* Users have a finite number of *lives* that keep track of the number of mistakes, only granting full editing permissions to users who make four mistakes or fewer.

## iD Basics

* iD is a JavaScript [OpenStreetMap](https://www.openstreetmap.org/) editor.
* It's intentionally simple. It lets you do the most basic tasks while not breaking other people's data.
* It supports all popular modern desktop browsers: Chrome, Firefox, Safari, Opera, and Edge.
* iD is not yet designed for mobile browsers, but this is something we hope to add!
* Data is rendered with [d3.js](https://d3js.org/).

## Participate!

* Read the project [Code of Conduct](CODE_OF_CONDUCT.md) and remember to be nice to one another.
* Read up on [Contributing and the code style of iD](CONTRIBUTING.md).
* See [open issues in the issue tracker](https://github.com/openstreetmap/iD/issues?state=open)
if you're looking for something to do.
* [Translate!](https://github.com/openstreetmap/iD/blob/develop/CONTRIBUTING.md#translating)
* Test a prerelease version of iD:
  * Stable mirror of `release` branch: https://ideditor-release.netlify.app
  * Development mirror of `develop` branch + latest translations: https://ideditor.netlify.app

Come on in, the water's lovely. More help? Ping `Martin Raifer`/`tyr_asd` or `bhousel` on:
* [OpenStreetMap US Slack](https://slack.openstreetmap.us/) (`#id` channel)
* [OpenStreetMap Discord](https://discord.gg/openstreetmap) (`#id` channel)
* [OpenStreetMap IRC](https://wiki.openstreetmap.org/wiki/IRC) (`irc.oftc.net`, in `#osm-dev`)
* [OpenStreetMap `dev` mailing list](https://wiki.openstreetmap.org/wiki/Mailing_lists)

## Prerequisites

* [Node.js](https://nodejs.org/) version 18 or newer
* [`git`](https://www.atlassian.com/git/tutorials/install-git/) for your platform
  * Note for Windows users:
    * Edit `$HOME\.gitconfig`:<br/>
      Add these lines to avoid checking in files with CRLF newlines<br><pre>
      [core]
          autocrlf = input</pre>

## Installation

To run the current development version of iD on your own computer:

#### Cloning the repository

The repository is reasonably large, and it's unlikely that you need the full history (~200 MB). If you are happy to wait for it all to download, run:

```
git clone https://github.com/ChrisG777/OSM_game.git
```

To clone only the most recent version, instead use a 'shallow clone':

```
git clone --depth=1 https://github.com/ChrisG777/OSM_game.git
```

If you want to add in the full history later on, perhaps to run `git blame` or `git log`, run `git fetch --depth=1000000`

#### Building iD

1. `cd` into the newly cloned project folder
2. Run `npm install`
3. Run `npm run all`
3. Run `npm start`
4. Open `http://127.0.0.1:8080/` in a web browser

For guidance on building a packaged version, running tests, and contributing to
development, see [CONTRIBUTING.md](CONTRIBUTING.md).


## License

iD is available under the [ISC License](https://opensource.org/licenses/ISC).
See the [LICENSE.md](LICENSE.md) file for more details.

iD also bundles portions of the following open source software.

* [D3.js (BSD-3-Clause)](https://github.com/d3/d3)
* [CLDR (Unicode Consortium Terms of Use)](https://github.com/unicode-cldr/cldr-json)
* [editor-layer-index (CC-BY-SA 3.0)](https://github.com/osmlab/editor-layer-index)
* [Font Awesome (CC-BY 4.0)](https://fontawesome.com/license)
* [Maki (CC0 1.0)](https://github.com/mapbox/maki)
* [Temaki (CC0 1.0)](https://github.com/ideditor/temaki)
* [Röntgen icon set (CC-BY 4.0)](https://github.com/enzet/map-machine#r%C3%B6ntgen-icon-set)
* [Mapillary JS (MIT)](https://github.com/mapillary/mapillary-js)
* [iD Tagging Schema (ISC)](https://github.com/openstreetmap/id-tagging-schema)
* [name-suggestion-index (BSD-3-Clause)](https://github.com/osmlab/name-suggestion-index)
* [osm-community-index (ISC)](https://github.com/osmlab/osm-community-index)


## Thank you

MapMania was developed at the 2024 Stanford x MIT Impactathon as a project for the Humanitarian OpenStreetMap Team (HOT) by George Cao, Chris Ge, Alan Lee and Nilay Mishra.

Initial development of iD was made possible by a [grant of the Knight Foundation](https://www.mapbox.com/blog/knight-invests-openstreetmap/).
