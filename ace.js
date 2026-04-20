/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for running ace commands
|--------------------------------------------------------------------------
|
| This file registers the TypeScript execution hook and boots the AdonisJS
| console entrypoint from bin/console.ts.
|
*/

import '@poppinss/ts-exec'

await import('./bin/console.js')
