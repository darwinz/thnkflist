import {
  Client,
  Account,
  Databases,
  ID,
  Permission,
  Query,
  Role,
} from "appwrite";
import { Server } from "../utils/config";

const LISTS = () => Server.listsCollectionID;
const ITEMS = () => Server.itemsCollectionID;
const DB = () => Server.databaseID;

const api = {
  sdk: null,

  provider: () => {
    if (api.sdk) return api.sdk;
    const client = new Client()
      .setEndpoint(Server.endpoint)
      .setProject(Server.project);
    api.sdk = {
      client,
      account: new Account(client),
      databases: new Databases(client),
    };
    return api.sdk;
  },

  // ── auth ──────────────────────────────────────────────────────────────
  createAccount: (email, password, name) =>
    api.provider().account.create(ID.unique(), email, password, name),

  getAccount: () => api.provider().account.get(),

  createSession: (email, password) =>
    api.provider().account.createEmailPasswordSession(email, password),

  createOAuth2Session: (provider, successUrl, failureUrl) =>
    api
      .provider()
      .account.createOAuth2Session(
        provider,
        successUrl ?? Server.oauth.successUrl,
        failureUrl ?? Server.oauth.failureUrl,
      ),

  deleteCurrentSession: () =>
    api.provider().account.deleteSession("current"),

  // ── lists ─────────────────────────────────────────────────────────────
  listLists: (userId, { limit = 25, cursor } = {}) => {
    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    return api.provider().databases.listDocuments(DB(), LISTS(), queries);
  },

  getList: (listId) =>
    api.provider().databases.getDocument(DB(), LISTS(), listId),

  createList: (userId, { title, note, mood } = {}) => {
    const data = {
      userId,
      title: title ?? null,
      note: note ?? null,
      mood: mood ?? null,
    };
    const perms = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];
    return api
      .provider()
      .databases.createDocument(DB(), LISTS(), ID.unique(), data, perms);
  },

  updateList: (listId, patch) =>
    api.provider().databases.updateDocument(DB(), LISTS(), listId, patch),

  // Cascade delete: drop items first, then the list itself.
  deleteList: async (listId) => {
    const { databases } = api.provider();
    let cursor;
    while (true) {
      const queries = [Query.equal("listId", listId), Query.limit(100)];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const page = await databases.listDocuments(DB(), ITEMS(), queries);
      if (page.documents.length === 0) break;
      for (const item of page.documents) {
        await databases.deleteDocument(DB(), ITEMS(), item.$id);
      }
      if (page.documents.length < 100) break;
      cursor = page.documents[page.documents.length - 1].$id;
    }
    return databases.deleteDocument(DB(), LISTS(), listId);
  },

  // ── items ─────────────────────────────────────────────────────────────
  listItems: (listId) =>
    api
      .provider()
      .databases.listDocuments(DB(), ITEMS(), [
        Query.equal("listId", listId),
        Query.orderAsc("position"),
        Query.limit(100),
      ]),

  createItem: async (userId, listId, content) => {
    const existing = await api
      .provider()
      .databases.listDocuments(DB(), ITEMS(), [
        Query.equal("listId", listId),
        Query.orderDesc("position"),
        Query.limit(1),
      ]);
    const nextPosition =
      existing.documents.length > 0 ? existing.documents[0].position + 1 : 0;
    const data = { listId, userId, content, position: nextPosition };
    const perms = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];
    return api
      .provider()
      .databases.createDocument(DB(), ITEMS(), ID.unique(), data, perms);
  },

  updateItem: (itemId, patch) =>
    api.provider().databases.updateDocument(DB(), ITEMS(), itemId, patch),

  deleteItem: (itemId) =>
    api.provider().databases.deleteDocument(DB(), ITEMS(), itemId),

  // ── analytics ─────────────────────────────────────────────────────────
  // Paginated fetch of every item belonging to the user. Used by /stats.
  listAllItemsForUser: async (userId, { pageSize = 100 } = {}) => {
    const { databases } = api.provider();
    const out = [];
    let cursor;
    while (true) {
      const queries = [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(pageSize),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const page = await databases.listDocuments(DB(), ITEMS(), queries);
      out.push(...page.documents);
      if (page.documents.length < pageSize) break;
      cursor = page.documents[page.documents.length - 1].$id;
    }
    return out;
  },

  listAllListsForUser: async (userId, { pageSize = 100 } = {}) => {
    const { databases } = api.provider();
    const out = [];
    let cursor;
    while (true) {
      const queries = [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(pageSize),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const page = await databases.listDocuments(DB(), LISTS(), queries);
      out.push(...page.documents);
      if (page.documents.length < pageSize) break;
      cursor = page.documents[page.documents.length - 1].$id;
    }
    return out;
  },
};

export default api;
