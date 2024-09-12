import FungibleToken from 0xFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews

access(all) fun main(address:Address, path:String):AnyStruct{

        var acc = getAuthAccount<auth(Storage) &Account>(address)

        var obj = acc.storage.borrow<&AnyResource>(from: StoragePath(identifier: path)!)!
        var meta = obj as? &{ViewResolver.Resolver}

        var view = meta!.resolveView(Type<FungibleTokenMetadataViews.FTDisplay>())
        if (view!=nil){
                return {
                    "object": obj,
                    "display": view
                }
        }

         return {"object": obj}

}