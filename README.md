# sr3e

<!-- Overview video goes here -->

sr3e is a Shadowrun Third Edition Homebrew game system for Foundry Virtual Tabletop (VTT). In Foundry, a game system is a modular software package that defines the rules, mechanics, and data structures for a specific tabletop role-playing game (TTRPG).

## Beta release

This is the first beta release of sr3e — the system is now playable end to end. It is still a hobby project developed in spare time, so expect rough edges, missing rules, and the occasional bug. If you run into one, please [report it](#contributing) — that's exactly what a beta is for.

## Architecture overview

The system follows a four-layer model: **Svelte UI → Service Layer → IStoreManager → Foundry VTT**. Actor and item sheets are built with Svelte 5 components that never touch Foundry documents directly — they read and write through a game-wide `IStoreManager` singleton, which is the only layer that talks to Foundry's actor/item/effect APIs. Rules and business logic live in a service layer beneath the UI, keeping components focused on presentation and services free of framework concerns. DataModels (rather than a legacy `template.json`) define the actor and item schemas.

## Localization

Translation strings are not hand-maintained in `lang/*.json`. Each config module under `lang/config/` declares the set of keys a category needs in TypeScript; a Vite plugin (`vite-plugins/i18n-scaffold.ts`) scans those declarations on every build and scaffolds the locale JSON files automatically — adding new keys with a placeholder value, pruning keys that no longer exist, and leaving existing translations untouched. This keeps every locale file in sync with the code without anyone having to remember to update them by hand. Translating the system is just a matter of editing the values in the relevant `lang/<locale>.json` file.

## Icon credit

Icons used throughout the system are sourced from [SVG Repo](https://www.svgrepo.com/), an open-source icon repository. Thank you to the artists whose freely licensed work makes this project more presentable — see `textures/svgrepo/` for the icons in use.

## AI-assisted development

Parts of this project — code, documentation, and tooling — have been developed with the assistance of AI. This is disclosed in the interest of transparency.

## Contributing

Contributions, bug reports, and feature requests are all welcome. If you'd like to report a bug or suggest an improvement, please use the issue templates on GitHub — they help route your report to the right place. If you'd like to contribute code or documentation you are welcome to tag along this sr3e adventure.

## What is Shadowrun Third Edition

Shadowrun 3rd Edition is a cyberpunk-fantasy tabletop role-playing game set in a dystopian future where magic has returned, blending high-tech with arcane powers. Released in 1998, it refines the core mechanics of its predecessors, focusing on the interplay between hacking, combat, and magical systems. Players take on roles like hackers (deckers), street samurai, or spell-slinging mages, navigating a gritty world dominated by megacorporations, cyber-enhanced mercenaries, and ancient, awakened creatures. The game uses a d6 dice pool system, emphasizing strategic planning and resource management while diving deep into rich lore and immersive world-building.

## What is Foundry VTT?

This system targets Foundry VTT, and can not be built or run without the Foundry VTT software and licence. A VTT (Virtual Tabletop) is a digital platform designed to simulate a tabletop gaming experience online. It allows players to collaborate in role-playing games (RPGs) like Dungeons & Dragons, Pathfinder, or Shadowrun, even if they're geographically separated.

Foundry Virtual Tabletop is a web-based application built primarily with JavaScript, utilizing HTML and CSS for its user interface. It operates on a Node.js server, leveraging Electron to provide a desktop application experience. For data storage, Foundry employs LevelDB, a fast key-value store, to manage game data and assets efficiently.

## Requirements

-  Software
   -  A licenced copy of Foundry Virtual Table Top

## Disclaimer

This project is a fan-made initiative created out of love for the Shadowrun 3rd Edition tabletop RPG. It is developed for personal enjoyment and the enjoyment of other fans.

-  This is an unofficial, non-commercial fan project, and it is not affiliated with or endorsed by the IP owners.
-  This project is designed to complement the original source material. The official rulebooks are required to fully understand and run the game. You may buy your copies here: [Shadowrun at DriveThroughRPG](https://www.drivethrurpg.com/en/product/1893/shadowrun-third-edition) or somwhere else where sold.
-  Shadowrun and all associated intellectual property are owned by their respective copyright holders.
-  The project may be removed from GitHub at any time if requested by the rights holders or for any other reason.

If you are a representative of the rights holders and have concerns about this project, please contact me, and I will address the matter promptly.
