/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as clerk from "../clerk.js";
import type * as codeSnippets from "../codeSnippets.js";
import type * as debug from "../debug.js";
import type * as fix from "../fix.js";
import type * as game from "../game.js";
import type * as games from "../games.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as scores from "../scores.js";
import type * as settings from "../settings.js";
import type * as snippets from "../snippets.js";
import type * as testData from "../testData.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  clerk: typeof clerk;
  codeSnippets: typeof codeSnippets;
  debug: typeof debug;
  fix: typeof fix;
  game: typeof game;
  games: typeof games;
  http: typeof http;
  init: typeof init;
  scores: typeof scores;
  settings: typeof settings;
  snippets: typeof snippets;
  testData: typeof testData;
  types: typeof types;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
