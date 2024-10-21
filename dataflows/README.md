# Dataflows

## Dataflow - Store Latest Usages

The [Store Latest Usages Dataflow](dataflows/store_latest_usages.json) runs every 10 minutes, copying the data from the user's `data.latestUsages` (ClientModify) to `data.usages` (ServerOnly). This process ensures long-term storage of usage data and prevents loss of old usages when adding new ones or in case of user data deletion.

### Steps

1. **Read emailAccounts**: Reads data from the `emailAccounts` data source, selecting the `UID`, `profile`, and `data` fields. It uses the `lastUpdatedTimestamp` field to fetch only the updated records.
2. **Process "latestUsages" to "usages"**: Evaluates each record to move new usages from `data.latestUsages` to `data.usages`. It ensures that only new usages are added and avoids duplicates.
3. **Update Lite**: Writes the processed data back to the `accounts.setAccountInfo` API, updating the `data` and `profile` fields and marking the record as `isLite`.

## Note

These dataflows are not part of this package but are configured in SAP Customer Data Cloud (CDC). They provide the necessary API keys for this project to function correctly.
