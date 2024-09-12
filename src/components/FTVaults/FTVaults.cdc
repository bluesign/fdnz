import FungibleToken from 0xFungibleToken
access(all) fun main(address:Address):AnyStruct{
    var acc = getAuthAccount<auth(Storage) &Account>(address)
    var results : [{String:AnyStruct}] = []
    acc.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
        if type.isSubtype(of: Type<@{FungibleToken.Vault}>()){
            var vault = acc.storage.borrow<&{FungibleToken.Vault}>(from:path)!
            results.append({"path":path, "balance":vault.balance, "type":type, "isRecovered": type.isRecovered})
        }
        return true
    })
    return results
}