access(all) fun main(address:Address):AnyStruct{
    var acc = getAuthAccount<auth(Storage) &Account>(address)
    return {
    "paths": acc.storage.storagePaths,
    "capacity": acc.storage.capacity,
    "used": acc.storage.used
    }

}