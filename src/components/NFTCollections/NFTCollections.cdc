import NonFungibleToken from 0xNonFungibleToken
import ViewResolver from 0xMetadataViews
import MetadataViews from 0xMetadataViews

access(all) fun main(address:Address):AnyStruct{
    var results : [{String:AnyStruct}] = []
    var acc = getAuthAccount<auth(Storage) &Account>(address)

    acc.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
        if type.isSubtype(of: Type<@{NonFungibleToken.Collection}>()){
            var collection = acc.storage.borrow<&{NonFungibleToken.Collection}>(from:path)!
            var obj = acc.storage.borrow<&AnyResource>(from:path)!
            var meta = obj as? &{ViewResolver.Resolver}

            results.append({"path":path, "count":collection.ownedNFTs.keys.length, "type":type, "isRecovered":type.isRecovered, "metadata": meta?.resolveView(Type<MetadataViews.NFTCollectionDisplay>())})
        }
        return true
    })
    return results
}