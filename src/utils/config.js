export const Server = {
  endpoint: process.env.REACT_APP_ENDPOINT,
  project: process.env.REACT_APP_PROJECT,
  databaseID: process.env.REACT_APP_DATABASE_ID,
  listsCollectionID: process.env.REACT_APP_LISTS_COLLECTION_ID,
  itemsCollectionID: process.env.REACT_APP_ITEMS_COLLECTION_ID,
  oauth: {
    successUrl:
      process.env.REACT_APP_OAUTH_SUCCESS_URL ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/lists`
        : undefined),
    failureUrl:
      process.env.REACT_APP_OAUTH_FAILURE_URL ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/login?error=oauth_failed`
        : undefined),
  },
};
