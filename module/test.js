/*

Goal: Automate publishing a release when running npm run release

Hard goals:
1) A release is published
2) The version is automatically bumped using standard version
3) The pattern for bumping is v|MAJOR|MINOR|PATCH|alpha|BUILD
4) the versionrc.json MUST look like this:
{
   "packageFiles": [
      { "filename": "package.json", "type": "json" },
      { "filename": "system.json", "type": "json" }
   ],
   "bumpFiles": [
      { "filename": "package.json", "type": "json" },
      { "filename": "system.json", "type": "json" }
   ],
   "tagPrefix": "v",
   "prerelease": "alpha"
}

5) it should work for alpha, beta and regular production.

6) The final published relase on github must contain the manifest link and the text
"This is an alpha build. No migration scripts are in effect, any work done in the current 
system may break without warning or future fixes."

Test 2

*/